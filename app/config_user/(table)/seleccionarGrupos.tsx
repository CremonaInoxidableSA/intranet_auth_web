"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchGrupos } from "../(data)/grupos"
import { GruposData } from "@/types/types"

type Props = {
  initialSelected: string[]
  onSave: (seleccionados: string[]) => void
}

export default function SeleccionarGrupos({ initialSelected, onSave }: Props) {
  const [grupos, setGrupos] = useState<GruposData[]>([])
  const [loading, setLoading] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [filtroInput, setFiltroInput] = useState("")
  const [filtro, setFiltro] = useState<string | null>(null)
  const [seleccionados, setSeleccionados] = useState<string[]>(initialSelected)

  useEffect(() => {
    setSeleccionados(initialSelected)
  }, [])

  const cargarGrupos = useCallback(async () => {
    setLoading(true)
    try {
      const headers = { Accept: "application/json" }
      const result = await fetchGrupos({ numeroPagina: pagina, filtro }, headers)
      setGrupos(result.data)
      setTotalPaginas(result.paginacion?.total_paginas || 1)
    } catch {
      toast.error("No se pudieron cargar los grupos")
    } finally {
      setLoading(false)
    }
  }, [pagina, filtro])

  useEffect(() => {
    cargarGrupos()
  }, [cargarGrupos])

  const toggle = (nombre: string) => {
    setSeleccionados((prev) =>
      prev.includes(nombre)
        ? prev.filter((n) => n !== nombre)
        : [...prev, nombre]
    )
  }

  const aplicarFiltro = () => {
    setPagina(1)
    const parsed = filtroInput.trim()
    setFiltro(parsed === "" ? null : parsed)
  }

  const limpiarFiltro = () => {
    setFiltroInput("")
    setFiltro(null)
    setPagina(1)
  }

  const canPrev = pagina > 1
  const canNext = pagina < Math.max(totalPaginas, 1)

  return (
    <DialogContent className="z-900 bg-background2 sm:max-w-125">
      <DialogHeader>
        <DialogTitle>Seleccionar grupos</DialogTitle>
        <DialogDescription>
          Marque los grupos que desea asignar al usuario. La selección se
          mantiene aunque cambie de página.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            value={filtroInput}
            onChange={(e) => setFiltroInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") aplicarFiltro()
            }}
            placeholder="Filtrar grupos"
            className="border border-background6 bg-background3"
          />
          <Button
            type="button"
            onClick={aplicarFiltro}
            className="border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
          >
            Filtrar
          </Button>
          <Button type="button" variant="outline" onClick={limpiarFiltro}>
            Limpiar
          </Button>
        </div>

        <div className="flex min-h-60 flex-col gap-1 overflow-y-auto rounded border border-background6 bg-background3 p-2">
          {loading ? (
            <div className="flex flex-1 items-center justify-center gap-2 py-8 text-sm">
              <Spinner />
              <span>Cargando...</span>
            </div>
          ) : grupos.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-8 text-sm opacity-60">
              No hay grupos disponibles
            </div>
          ) : (
            grupos.map((grupo) => {
              const checked = seleccionados.includes(grupo.nombre)
              return (
                <label
                  key={grupo.nombre}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-foreground/10"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(grupo.nombre)}
                  />
                  <span>{grupo.nombre}</span>
                </label>
              )
            })
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm opacity-60">
            {seleccionados.length} grupo(s) seleccionado(s)
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </Button>
            <span className="min-w-20 text-center text-sm">
              Página {pagina} de {Math.max(totalPaginas, 1)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() =>
                setPagina((prev) => Math.min(prev + 1, Math.max(totalPaginas, 1)))
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" onClick={() => onSave(seleccionados)}>
            Guardar
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}