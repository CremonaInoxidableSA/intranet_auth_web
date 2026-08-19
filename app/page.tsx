"use client"

import { useMemo, type ComponentType } from "react"
import {
  CircleHelp,
  KeyRound,
  LayoutGrid,
  ShieldCheck,
  User,
  type LucideProps,
  icons as lucideIcons,
} from "lucide-react"
import { IoIosCloudDone } from "react-icons/io"
import { MdOutlineFactory } from "react-icons/md"
import { SiAutodesk } from "react-icons/si"
import { useAuth } from "@/context/AuthProvider"

const fallbackIcons: Record<string, ComponentType<LucideProps>> = {
  Auth: ShieldCheck,
  Dashboard: LayoutGrid,
  Key: KeyRound,
  User,
}

const reactIconsMap: Record<string, ComponentType<{ className?: string }>> = {
  IoIosCloudDone,
  MdOutlineFactory,
  SiAutodesk,
}

const MODULOS_OCULTOS_HOME = new Set(["MODULO_AUTH"])

const toAbsoluteUrl = (path: string) => {
  const rawPath = path.trim()

  if (!rawPath) {
    return "#"
  }

  if (rawPath.startsWith("/")) {
    return rawPath.replace(/\/{2,}/g, "/")
  }

  if (/^https?:\/\//i.test(rawPath)) {
    const [protocolo, ...resto] = rawPath.split("://")
    const rutaNormalizada = resto.join("://").replace(/\/{2,}/g, "/")
    return `${protocolo}://${rutaNormalizada}`
  }

  if (rawPath.includes(".")) {
    return `https://${rawPath}`.replace(/([^:]\/)\/+?/g, "$1")
  }

  return `/${rawPath.replace(/^\/+/, "").replace(/\/{2,}/g, "/")}`
}

const resolveIcon = (iconName: string) => {
  const fromReactIcons = reactIconsMap[iconName]

  if (fromReactIcons) {
    return fromReactIcons
  }

  const fromFallback = fallbackIcons[iconName]

  if (fromFallback) {
    return fromFallback
  }

  const lucideIcon = lucideIcons[iconName as keyof typeof lucideIcons]

  return lucideIcon ?? CircleHelp
}

const toTitle = (value: string) =>
  value
    .replace(/^MODULO_/, "")
    .replace(/_/g, " ")
    .toUpperCase()

export default function Page() {
  const { user } = useAuth()

  const sistemas = useMemo(
    () =>
      Object.entries(user?.modulos_personales ?? {})
        .filter(([nombre]) => !MODULOS_OCULTOS_HOME.has(nombre))
        .map(([nombre, modulo]) => ({
          nombre,
          titulo: toTitle(nombre),
          url: toAbsoluteUrl(modulo.path),
          Icon: resolveIcon(modulo.icono),
        })),
    [user?.modulos_personales]
  )

  return (
    <div className="flex w-full flex-col items-center gap-5 p-5 text-center font-medium">
      <p className="max-w-3xl text-base leading-7">
        Hola, bienvenido a la Sistema General de Cremona Inoxidable S.A. Desde
        acá podés acceder a los siguientes sistemas:
      </p>
      {sistemas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tenes modulos personales asignados.
        </p>
      ) : (
        <div className="grid h-full w-full grid-cols-2 content-start justify-center gap-5 p-5 md:px-50 md:py-20 xl:flex xl:flex-1 xl:flex-wrap">
          {sistemas.map((sistema) => {
            const Icon = sistema.Icon

            return (
              <a
                key={sistema.nombre}
                href={sistema.url}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded bg-background2 p-5 text-center transition hover:bg-background4 xl:w-1/6"
              >
                <Icon className="aspect-square size-20" />
                <div className="text-sm font-semibold xl:text-xl">
                  {sistema.titulo}
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
