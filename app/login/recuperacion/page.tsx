"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { urlConfig } from "@/lib/config"

import { LogoCreminoxInnovate as Logo } from "@/components/Logos"
import { Button } from "@/components/ui/button"

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
    <section className="flex h-full w-full items-center justify-center">
      <div className="bg-backgroundoscuro flex h-[60vh] w-auto max-w-480 flex-col items-center gap-3.75 rounded p-[3rem_4rem_2rem_4rem]">
        <Logo extraClass="h-1/2" />

        <form
          className="flex h-[60%] w-full flex-col justify-between gap-2.5"
          onSubmit={handleSubmit}
        >
          <div className="flex h-1/3 flex-col gap-1.25">
            <label
              htmlFor="email"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Introduzca su correo electrónico
            </label>
            <input
              className="flex h-2/3 w-full items-center justify-center rounded border-none bg-background2 p-1 px-4"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex h-1/3 flex-col gap-1.25">
            <label
              htmlFor="email"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Introduzca su usuario
            </label>
            <input
              className="flex h-2/3 w-full items-center justify-center rounded border-none bg-background2 p-1 px-4"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="h-13 w-full items-center justify-center rounded border border-redcremona bg-redcremona/80 p-1 text-white hover:bg-redcremona/50"
          >
            {loading ? <Spinner /> : "Enviar correo de recuperación"}
          </Button>
        </form>

        <Link
          className="h-auto text-[14px] font-semibold opacity-40 ease-in-out hover:text-redcremona hover:opacity-100"
          href={urlConfig.loginUrl}
        >
          Iniciar sesión
        </Link>
      </div>
    </section>
  )
}

export default Recuperacion
