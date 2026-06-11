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
      <div className="sticky top-0 left-0 z-551 w-full">
        {!hideHeader && <Header />}
      </div>
      <main
        className={`flex w-full min-w-0 grow ${
          pathname === "/login" ||
          pathname === "/login/recuperacion" ||
          pathname === "/login/recuperacion/reset_pass"
            ? "flex items-center justify-center"
            : ""
        }`}
      >
        {children}
      </main>
      <Toaster />
    </div>
  )
}
