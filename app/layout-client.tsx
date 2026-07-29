"use client"
import Header from "@/components/headerPrincipal"
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="flex items-center gap-3 rounded-md border border-background6 bg-background3/80 px-5 py-4">
              <Spinner className="size-5" />
              <span>Cargando sesion...</span>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      <Toaster />
    </div>
  )
}
