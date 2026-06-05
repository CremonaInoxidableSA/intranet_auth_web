"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

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
        const res = await fetch(`/api/needs-setup`)
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
      const res = await fetch(`/api/proxy/auth/create-superadmin`, {
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

      await fetch("/api/needs-setup/invalidate", { method: "POST" })
      if (typeof window !== "undefined") {
        localStorage.removeItem("setup_check_cache")
      }

      setSuccessMessage(
        "Superadmin creado exitosamente. Redirigiendo al login..."
      )
      setNeedsSetup(false)
      setLoading(false)

      timerRef.current = setTimeout(() => {
        router.push("/login")
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
      <div className="flex h-auto w-[40vw] flex-col rounded-md bg-background2 p-5">
        <h1 className="flex w-full justify-center text-4xl font-semibold">
          Crear Superadmin Inicial
        </h1>
        <p className="text-md my-3">
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
          <div className="flex h-1/3 flex-col gap-1.25">
            <label
              htmlFor="username"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex h-2/3 w-full items-center justify-center rounded-md border-none bg-background3 p-1 px-4"
            />
          </div>

          <div className="flex h-1/3 flex-col gap-1.25">
            <label
              htmlFor="email"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-2/3 w-full items-center justify-center rounded-md border-none bg-background3 p-1 px-4"
            />
          </div>

          <div className="flex h-1/3 flex-col gap-1.25">
            <label
              htmlFor="nombre"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="flex h-2/3 w-full items-center justify-center rounded-md border-none bg-background3 p-1 px-4"
            />
          </div>

          <div className="flex h-1/3 flex-col gap-1.25">
            <label
              htmlFor="apellido"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Apellido
            </label>
            <input
              id="apellido"
              type="text"
              required
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="flex h-2/3 w-full items-center justify-center rounded-md border-none bg-background3 p-1 px-4"
            />
          </div>

          <div className="flex h-1/3 flex-col gap-1.25">
            <label
              htmlFor="password"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-2/3 w-full items-center justify-center rounded-md border-none bg-background3 p-1 px-4"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!successMessage}
            className="mt-4 flex h-13 w-full cursor-pointer items-center justify-center rounded-md border-none bg-[#e82a31] p-1 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#a82328]"
          >
            {loading ? "Creando..." : "Crear Superadmin"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default BootstrapPage
