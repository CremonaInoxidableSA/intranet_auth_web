"use client"
import Header from "@/components/headerPrincipal"
import { LogoCreminox } from "@/components/Logos"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthProvider"
import { useEffect, useState } from "react"

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()
  const [showLoader, setShowLoader] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!loading) {
      setFadeOut(true)
      const timer = setTimeout(() => {
        setShowLoader(false)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setFadeOut(false)
      setShowLoader(true)
    }
  }, [loading])

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>

      {showLoader && (
        <div
          className={`fixed inset-0 z-9999 flex flex-col items-center justify-center gap-5 bg-background transition-opacity duration-500 ease-in-out ${fadeOut ? "opacity-0" : "opacity-100"} `}
        >
          <LogoCreminox extraClass="h-16 w-auto" />
          <div className="flex items-center gap-3 text-base font-medium">
            <Spinner className="size-5" />
            <span>Cargando sesión...</span>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  )
}
