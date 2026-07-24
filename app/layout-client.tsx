"use client"
import Header from "@/components/headerPrincipal"
import { Toaster } from "@/components/ui/sonner"

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Toaster />
    </div>
  )
}
