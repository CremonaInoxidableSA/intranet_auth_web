"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { LogoCreminoxInnovate as Logo } from "@/components/Logos";

const Spinner = () => (
  <div className="h-6 w-6 animate-spin rounded-[100%] border border-solid border-[#f3f3f3] border-t-[#e82a31]" />
)

const ResetPasswordContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const tokenRef = useRef<string | null>(null)
  const [email, setEmail] = useState<string>("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)

  const verificarToken = useCallback(async (tokenToVerify: string) => {
    try {
      const response = await fetch(
        `/api/proxy/mail/verificar-token-recuperacion?token=${tokenToVerify}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      )

      const data = await response.json()

      if (response.ok && data.success) {
        setTokenValid(true)
        setEmail(data.email)
      } else {
        toast.error(data.error || "Token inválido o expirado")
        setTokenValid(false)
      }
    } catch {
      toast.error("Error de conexión con el servidor")
      setTokenValid(false)
    } finally {
      setValidatingToken(false)
    }
  }, [])

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token")

    const verify = async () => {
      if (!tokenFromUrl) {
        toast.error("Token no encontrado")
        setValidatingToken(false)
        return
      }

      tokenRef.current = tokenFromUrl
      await verificarToken(tokenFromUrl)
    }

    verify()
  }, [searchParams, verificarToken])

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

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/proxy/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenRef.current,
          new_password: newPassword,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Contraseña actualizada exitosamente")
        timerRef.current = setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast.error(data.error || "Error al actualizar la contraseña")
      }
    } catch {
      toast.error("Error de conexión con el servidor")
    } finally {
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <section className="flex h-full w-full items-center justify-center">
        <div className="bg-backgroundoscuro flex h-[40vh] w-auto max-w-480 flex-col items-center justify-center gap-3.75 rounded p-[3rem_4rem_2rem_4rem]">
          <Logo extraClass="flex h-auto w-[65%] p-0" />
          <div className="flex flex-col items-center gap-4">
            <Spinner />
            <p className="text-center">Verificando token...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!tokenValid) {
    return (
      <section className="flex h-full w-full items-center justify-center">
        <div className="bg-backgroundoscuro flex h-[40vh] w-auto max-w-480 flex-col items-center justify-center gap-3.75 rounded p-[3rem_4rem_2rem_4rem]">
          <Logo extraClass="flex h-auto w-[65%] p-0" />
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-center font-semibold text-redcremona">
              Token inválido o expirado
            </p>
            <Link
              className="flex h-auto w-full cursor-pointer justify-center text-center text-[14px] font-semibold tracking-[0.5px] text-[#5d5d5d] ease-in-out hover:text-[#e82a31]"
              href="/login/recuperacion"
            >
              Solicitar nuevo enlace
            </Link>
            <Link
              className="flex h-auto w-full cursor-pointer justify-center text-center text-[14px] font-semibold tracking-[0.5px] text-[#5d5d5d] ease-in-out hover:text-[#e82a31]"
              href="/login"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex h-full w-full items-center justify-center">
      <div className="bg-backgroundoscuro flex h-auto w-auto max-w-480 flex-col items-center gap-3.75 rounded p-[3rem_4rem_2rem_4rem]">
        <Logo extraClass="flex h-auto w-[65%] p-0" />

        <div className="mb-4 w-full text-center">
          <h2 className="mb-2 text-xl font-semibold">Restablecer contraseña</h2>
          <p className="text-sm text-gray-400">Para: {email}</p>
        </div>

        <form
          className="flex w-full flex-col justify-between gap-4"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.25">
            <label
              htmlFor="newPassword"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Nueva contraseña
            </label>
            <input
              className="flex w-full items-center justify-center rounded border-none bg-background2 p-3 px-4"
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="flex flex-col gap-1.25">
            <label
              htmlFor="confirmPassword"
              className="flex text-[17px] font-semibold tracking-[0.5px]"
            >
              Confirmar contraseña
            </label>
            <input
              className="flex w-full items-center justify-center rounded border-none bg-background2 p-3 px-4"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repetí la contraseña"
            />
          </div>

          <Button
            disabled={loading}
            type="submit"
            className="mt-1.25 flex h-13 w-full cursor-pointer items-center justify-center rounded border-none bg-[#e82a31] p-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#a82328]"
          >
            {loading ? <Spinner /> : "Actualizar contraseña"}
          </Button>
        </form>

        <Link
          className="mt-2 flex h-auto w-full cursor-pointer justify-center text-center text-[14px] font-semibold tracking-[0.5px] text-[#5d5d5d] ease-in-out hover:text-[#e82a31]"
          href="/login"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </section>
  )
}

const ResetPassword = () => (
  <Suspense
    fallback={
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    }
  >
    <ResetPasswordContent />
  </Suspense>
)

export default ResetPassword
