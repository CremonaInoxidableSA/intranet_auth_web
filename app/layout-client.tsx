"use client"
import Header from "@/components/headerPrincipal"
import { LogoCreminox } from "@/components/Logos"
import { Toaster } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/context/AuthProvider"

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>

      {loading && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background px-6">
          <div className="flex flex-col items-center gap-6">
            <LogoCreminox extraClass="h-16 w-auto" />
            <div className="flex items-center gap-3 text-base font-medium">
              <Spinner className="size-5" />
              <span>Cargando sesion...</span>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  )
}
