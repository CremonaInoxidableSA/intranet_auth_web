"use client"

import { useMemo, type ComponentType } from "react"
import { type LucideProps } from "lucide-react"
import { useAuth } from "@/context/AuthProvider"
import { getModulosPersonales } from "@/lib/modulosUtils"

export default function Page() {
  const { user } = useAuth()

  const sistemas = useMemo(
    () =>
      getModulosPersonales(user?.modulos_personales ?? {}).map((modulo) => ({
        ...modulo,
        url: modulo.path,
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
            const Icon = sistema.Icon as ComponentType<LucideProps> | undefined

            if (!Icon) return null

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
