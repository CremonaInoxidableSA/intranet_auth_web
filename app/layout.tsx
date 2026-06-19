import { Geist_Mono, Roboto } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme/themeProvider"
import LayoutClient from "./layout-client"
import { AuthProvider } from "@/context/AuthProvider"
import { cn } from "@/lib/utils"

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        roboto.variable
      )}
    >
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <LayoutClient>{children}</LayoutClient>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
