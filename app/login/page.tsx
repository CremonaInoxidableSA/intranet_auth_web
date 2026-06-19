"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthProvider"

import { LogoCreminoxInnovate as Logo } from "@/components/Logos"
import { Inputs, Boton } from "@/components/components"
import { toast } from "sonner"

const Spinner = () => (
  <div className="h-6 w-6 animate-spin rounded-[100%] border border-solid border-[#f3f3f3] border-t-[#e82a31]" />
)

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-center",
      })
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await login(username, password)

      if (!result.success) {
        setError(result.error || "Error")
      }
    } catch {
      setError("Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="flex flex-1 items-center justify-center p-5"
      aria-labelledby="login-title"
    >
      <div className="flex xl:w-1/2 flex-col items-center justify-center gap-5 rounded">
        <Logo extraClass="xl:h-1/2" />

        <h1 id="login-title" className="sr-only">
          Iniciar Sesión
        </h1>

        <form
          className="flex h-[60%] w-full flex-col justify-between gap-5"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="username"
            className="flex h-1/3 cursor-pointer flex-col gap-1.25"
          >
            <span className="flex font-semibold">Introduzca su usuario</span>
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
            htmlFor="password"
            className="flex h-1/3 cursor-pointer flex-col gap-1.25"
          >
            <span className="flex font-semibold tracking-[0.5px]">
              Introduzca su contraseña
            </span>
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
            disabled={loading}
          >
            {loading ? <Spinner /> : "Ingresar"}
          </Boton>
        </form>

        <Link
          className="text-sm font-semibold opacity-40 ease-in-out hover:text-redcremona hover:opacity-100"
          href="/login/recuperacion"
        >
          Recuperar contraseña
        </Link>
      </div>
    </section>
  )
}

export default Login
