"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthProvider"

import { LogoCreminoxInnovate as Logo } from "@/components/Logos"
import { Button } from "@/components/ui/button"
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

          <div className="flex h-1/3 flex-col gap-1.25">
            <label
              htmlFor="password"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Introduzca su contraseña
            </label>
            <input
              className="flex h-2/3 w-full items-center justify-center rounded border-none bg-background2 p-1 px-4"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="flex h-13 w-full cursor-pointer items-center justify-center rounded border border-redcremona bg-redcremona/80 p-1 text-white hover:bg-redcremona/50"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? <Spinner /> : "Acceder"}
          </Button>
        </form>

        <Link
          className="flex h-auto cursor-pointer justify-center text-center text-[14px] font-semibold tracking-[0.5px] text-foreground/50 ease-in-out hover:text-redcremona"
          href="/login/recuperacion"
        >
          Recuperar contraseña
        </Link>
      </div>
    </section>
  )
}

export default Login
