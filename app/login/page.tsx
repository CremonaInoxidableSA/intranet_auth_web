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

  const handleLogin = async () => {
    setError("")
    setLoading(true)

    try {
      const result = await login()
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
      <div className="flex flex-col items-center justify-center gap-5 rounded xl:w-1/2">
        <Logo extraClass="xl:h-1/2" />

        <h1 id="login-title" className="sr-only">
          Iniciar Sesión
        </h1>

        <div className="flex h-[60%] w-full flex-col justify-center gap-5">
          <p className="text-center text-sm leading-6 text-slate-500">
            Serás redirigido al proveedor de identidad Keycloak para iniciar
            sesión.
          </p>
          <Boton
            type="button"
            extraClass="items-center justify-center border-redcremona bg-redcremona/50 p-1 text-white hover:bg-redcremona/80"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Ingresar con Keycloak"}
          </Boton>
        </div>

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
