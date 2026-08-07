"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HoverInfo, TextScrollArea } from "@/components/components"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import SeleccionarModulos from "../(table)/seleccionarModulos"
import SeleccionarPermisos from "../(table)/seleccionarPermisos"
import SeleccionarSubmodulos from "../(table)/seleccionarSubmodulos"
import { GruposData } from "@/types/types"

type Props = {
  onGrupoCreated?: () => void
  isEditing?: boolean
  initialData?: GruposData
}

const toNameList = (
  items: Array<string | { nombre?: string }> | undefined
): string[] =>
  (items ?? [])
    .map((item) => (typeof item === "string" ? item : (item.nombre ?? "")))
    .filter(Boolean)

const hoverInfoText = {
  nombre: 'El grupo debe tener el fomato "GRUPO_{nombre}"',
}

export default function FormGrupo({
  onGrupoCreated,
  isEditing = false,
  initialData,
}: Props) {
  const [nombreGrupo, setNombreGrupo] = useState(initialData?.nombre ?? "")
  const [identifier] = useState(initialData?.nombre ?? "")
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    toNameList(initialData?.permisos)
  )
  const [modulosSeleccionados, setModulosSeleccionados] = useState<string[]>(
    toNameList(initialData?.modulos)
  )
  const [submodulosSeleccionados, setSubmodulosSeleccionados] = useState<
    string[]
  >(toNameList(initialData?.submodulos))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  useEffect(() => {
    if (!isEditing || !identifier) {
      return
    }

    const loadDetalle = async () => {
      setIsLoadingDetail(true)
      try {
        const response = await fetchWithKeycloak(
          `/api/permisos/grupos/detalle?grupo_nombre=${encodeURIComponent(
            identifier
          )}`
        )

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          toast.error(
            data?.error || data?.detail || "Error al cargar detalle del grupo"
          )
          return
        }

        const data = await response.json()
        if (data) {
          setNombreGrupo(data?.nombre ?? identifier)
          setPermisosSeleccionados(toNameList(data?.permisos))
          setModulosSeleccionados(toNameList(data?.modulos))
          setSubmodulosSeleccionados(toNameList(data?.submodulos))
        }
      } catch {
        toast.error("Error de conexión al cargar detalle del grupo")
      } finally {
        setIsLoadingDetail(false)
      }
    }

    void loadDetalle()
  }, [identifier, isEditing])

  const handleSubmit = async () => {
    if (!nombreGrupo.trim()) {
      toast.error("El nombre del grupo es obligatorio")
      return
    }

    const recordIdentifier = isEditing
      ? identifier || initialData?.nombre || nombreGrupo.trim()
      : undefined

    const resolvedIdentifier = recordIdentifier?.trim() || ""

    if (isEditing && !resolvedIdentifier) {
      toast.error("No se pudo identificar el grupo a editar")
      return
    }

    const payload = isEditing
      ? {
          permisos: permisosSeleccionados,
          modulos: modulosSeleccionados,
          submodulos: submodulosSeleccionados,
        }
      : {
          nombre: nombreGrupo.trim(),
          permisos: permisosSeleccionados,
          modulos: modulosSeleccionados,
          submodulos: submodulosSeleccionados,
        }

    setIsSubmitting(true)

    try {
      const endpoint = isEditing
        ? `/api/permisos/grupos/editar?grupo_nombre=${encodeURIComponent(resolvedIdentifier)}`
        : "/api/permisos/grupos/crear"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetchWithKeycloak(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || data?.detail || "Error al guardar grupo")
        return
      }

      toast.success(
        isEditing
          ? "Grupo actualizado correctamente"
          : "Grupo creado correctamente"
      )
      onGrupoCreated?.()
    } catch {
      toast.error("Error de conexión con la API")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEditing && isLoadingDetail) {
    return (
      <DialogContent className="z-100 bg-background3 sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Cargando...</DialogTitle>
          <DialogDescription>
            Espere mientras cargan los datos del grupo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-8">
          <p>Cargando...</p>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="z-100 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Editar Grupo" : "Crear Grupo"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Actualice los datos del grupo y guarde los cambios."
            : "Complete los datos para crear un nuevo grupo."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="grupo">Nombre del Grupo</Label>
            <HoverInfo
              placeholder="i"
              content={
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Nombre del grupo</p>
                  <p>{hoverInfoText.nombre}</p>
                </div>
              }
              extraClass="h-4 px-0 text-xs text-muted-foreground"
            />
          </div>
          <Input
            id="grupo"
            disabled={isEditing}
            value={nombreGrupo}
            onChange={(e) => setNombreGrupo(e.target.value)}
            placeholder="Asigne un nombre único para este grupo"
            required
            className={`border border-background6 bg-background3 ${isEditing ? "cursor-not-allowed" : ""}`}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Permisos</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  {permisosSeleccionados.length > 0
                    ? "Editar permisos"
                    : "+ Agregar permisos"}
                </Button>
              </DialogTrigger>
              <SeleccionarPermisos
                initialSelected={permisosSeleccionados}
                onSave={setPermisosSeleccionados}
              />
            </Dialog>
          </div>
          <TextScrollArea
            tags={permisosSeleccionados}
            extraClass="h-40 rounded border border-background6 bg-background3 p-2"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Módulos</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  {modulosSeleccionados.length > 0
                    ? "Editar módulos"
                    : "+ Agregar módulos"}
                </Button>
              </DialogTrigger>
              <SeleccionarModulos
                initialSelected={modulosSeleccionados}
                onSave={setModulosSeleccionados}
              />
            </Dialog>
          </div>
          <TextScrollArea
            tags={modulosSeleccionados}
            extraClass="h-40 rounded border border-background6 bg-background3 p-2"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Submódulos</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  {submodulosSeleccionados.length > 0
                    ? "Editar submódulos"
                    : "+ Agregar submódulos"}
                </Button>
              </DialogTrigger>
              <SeleccionarSubmodulos
                initialSelected={submodulosSeleccionados}
                onSave={setSubmodulosSeleccionados}
              />
            </Dialog>
          </div>
          <TextScrollArea
            tags={submodulosSeleccionados}
            extraClass="h-40 rounded border border-background6 bg-background3 p-2"
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit} loading={isSubmitting}>
          {isEditing ? "Guardar cambios" : "Crear Grupo"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
