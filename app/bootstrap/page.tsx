"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Boton, Inputs } from "@/components/components"
import { Spinner } from "@/components/ui/spinner"

const BootstrapPage = () => {
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [needsSetup, setNeedsSetup] = useState(false)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch(`/api/bootstrap/needs-setup`)
        const data = await res.json()

        if (data.needs_setup) {
          setNeedsSetup(true)
        } else {
          router.push("/login")
        }
      } catch {
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkSetup()
  }, [router])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/bootstrap/create-superadmin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          nombre,
          apellido,
          password,
        }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        setError(result.message ?? "Error al crear el superadmin")
        setLoading(false)
        return
      }

      const invalidateRes = await fetch(
        "/api/bootstrap/needs-setup/invalidate",
        {
          method: "POST",
        }
      )
      if (!invalidateRes.ok) {
        console.warn("No se pudo invalidar la caché, pero continuamos")
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("setup_check_cache")
      }

      setSuccessMessage(
        "Superadmin creado exitosamente. Redirigiendo al login..."
      )
      setNeedsSetup(false)
      setLoading(false)

      timerRef.current = setTimeout(() => {
        window.location.href = "/login"
      }, 2000)
    } catch (err) {
      setError(`Error al conectarse con el servidor: ${err}`)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p>Verificando estado del sistema...</p>
      </div>
    )
  }

  if (!needsSetup) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <p>La configuración inicial ya está completa. Redirigiendo...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="flex h-auto w-[40vw] flex-col gap-5 rounded-md bg-background2 p-5">
        <h1 className="flex w-full justify-center text-4xl font-semibold">
          Crear superadmin inicial
        </h1>
        <p className="text-md text-redcremona opacity-70">
          No hay usuarios en la base de datos. Por favor, crea el usuario
          administrador.
        </p>

        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}

        {error && <div className="text-red-500">❌ {error}</div>}

        <form
          onSubmit={handleSubmit}
          className="flex h-auto w-full flex-col gap-2.5"
        >
          <label
            htmlFor="username"
            className="flex h-1/3 cursor-pointer flex-col gap-1.25"
          >
            <span className="flex font-semibold">Usuario</span>
            <Inputs
              placeholder="Ingrese su nombre de usuario"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label
            htmlFor="email"
            className="flex h-1/3 cursor-pointer flex-col gap-1.25"
          >
            <span className="flex font-semibold">E-mail</span>
            <Inputs
              placeholder="Ingrese su email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label
            htmlFor="name"
            className="flex h-1/3 cursor-pointer flex-col gap-1.25"
          >
            <span className="flex font-semibold">Nombre</span>
            <Inputs
              placeholder="Ingrese su nombre"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          <label
            htmlFor="surname"
            className="flex h-1/3 cursor-pointer flex-col gap-1.25"
          >
            <span className="flex font-semibold">Apellido</span>
            <Inputs
              placeholder="Ingrese su apellido"
              id="surname"
              name="surname"
              type="text"
              autoComplete="surname"
              required
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </label>

          <label
            htmlFor="password"
            className="flex h-1/3 cursor-pointer flex-col gap-1.25"
          >
            <span className="flex font-semibold">Contraseña</span>
            <Inputs
              placeholder="Ingrese su contraseña"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <Boton
            type="submit"
            extraClass="items-center justify-center border-redcremona bg-redcremona/50 p-1 text-white hover:bg-redcremona/80"
            disabled={loading || !!successMessage}
          >
            {loading ? <Spinner /> : "Crear Superadmin"}
          </Boton>
        </form>
      </div>
    </div>
  )
}

export default BootstrapPage
