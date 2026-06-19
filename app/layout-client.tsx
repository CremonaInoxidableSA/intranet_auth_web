"use client"
import { usePathname } from "next/navigation"

import Header from "@/components/headerPrincipal"

import { Toaster } from "@/components/ui/sonner"

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hideHeader = [
    "/signup",
    "/login",
    "/login/recuperacion",
    "/login/recuperacion/reset_pass",
  ].includes(pathname)

  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeader && <Header />}
      <main className="flex flex-1 flex-col">{children}</main>
      <Toaster />
    </div>
  )
}
