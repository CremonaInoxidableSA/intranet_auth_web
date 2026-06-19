"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { urlConfig } from "@/lib/config"

import { LogoCreminoxInnovate as Logo } from "@/components/Logos"
import { Boton, Inputs } from "@/components/components"

const Spinner = () => (
  <div className="h-6 w-6 animate-spin rounded-[100%] border border-solid border-[#f3f3f3] border-t-[#e82a31]" />
)

const Recuperacion = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/proxy/auth/recuperacion_check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Correo enviado correctamente")
      } else {
        toast.error(data.error || data.message || "Error al enviar el correo")
      }
    } catch (err) {
      toast.error(`Error de conexión con el servidor: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="flex flex-1 items-center justify-center"
      aria-labelledby="login-title"
    >
      <div className="flex flex-col items-center justify-center gap-5 rounded xl:w-1/2">
        <Logo extraClass="xl:h-1/2" />

        <h1 id="login-title" className="sr-only">
          Iniciar Sesión
        </h1>

        <form
          className="flex h-[60%] w-full flex-col justify-between gap-5"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="email"
            className="flex h-1/3 cursor-pointer flex-col gap-1.25"
          >
            <span className="flex font-semibold">
              Introduzca su correo electrónico
            </span>
            <Inputs
              placeholder="Ingrese el correo electrónico vinculado a la cuenta"
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

          <Boton
            type="submit"
            extraClass="items-center justify-center border-redcremona bg-redcremona/50 p-1 text-white hover:bg-redcremona/80"
            disabled={loading}
          >
            {loading ? <Spinner /> : "Enviar correo de recuperacion"}
          </Boton>
        </form>

        <Link
          className="text-sm font-semibold opacity-40 ease-in-out hover:text-redcremona hover:opacity-100"
          href="/login"
        >
          Iniciar sesión
        </Link>
      </div>
    </section>
  )
}

export default Recuperacion
