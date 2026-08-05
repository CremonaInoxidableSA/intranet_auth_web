"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PermisosData } from "@/types/types"

type Props = {
  onPermisoCreated?: () => void
  isEditing?: boolean
  initialData?: PermisosData
}

export default function FormPermiso({
  onPermisoCreated,
  isEditing = false,
  initialData,
}: Props) {
  const [nombre, setNombre] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  useEffect(() => {
    setNombre(initialData?.nombre ?? "")
    setIdentifier(initialData?.nombre ?? "")
  }, [initialData])

  useEffect(() => {
    if (!isEditing || !identifier) {
      return
    }

    const loadDetalle = async () => {
      setIsLoadingDetail(true)
      try {
        const response = await fetchWithKeycloak(
          `/api/permisos/permisos/detalle?permiso_nombre=${encodeURIComponent(identifier)}`
        )

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          toast.error(
            data?.error || data?.detail || "Error al cargar detalle del permiso"
          )
          return
        }

        const data = await response.json()
        setNombre(data?.nombre ?? identifier)
      } catch {
        toast.error("Error de conexión al cargar detalle del permiso")
      } finally {
        setIsLoadingDetail(false)
      }
    }

    void loadDetalle()
  }, [identifier, isEditing])

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre del permiso es obligatorio")
      return
    }

    const recordIdentifier = isEditing
      ? identifier || initialData?.nombre || nombre.trim()
      : undefined

    const resolvedIdentifier = recordIdentifier?.trim() || ""

    if (isEditing && !resolvedIdentifier) {
      toast.error("No se pudo identificar el permiso a editar")
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = isEditing
        ? `/api/permisos/permisos/editar?permiso_nombre=${encodeURIComponent(
            resolvedIdentifier
          )}`
        : "/api/permisos/permisos/crear"
      const method = isEditing ? "PUT" : "POST"
      const payload = { nombre: nombre.trim() }

      const res = await fetchWithKeycloak(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || data?.detail || "Error al guardar permiso")
        return
      }

      toast.success(
        isEditing
          ? "Permiso actualizado correctamente"
          : "Permiso creado correctamente"
      )
      onPermisoCreated?.()
    } catch {
      toast.error("Error de conexión con la API")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="z-100 bg-background2 sm:max-w-120">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar permiso" : "Crear permiso"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Modifique los datos del permiso y guarde los cambios."
            : "Ingrese el nombre del permiso que desea crear."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="permiso">Nombre del permiso</Label>
          </div>
          <Input
            id="permiso"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingrese el nombre del permiso"
            disabled={isEditing && isLoadingDetail}
            className="border border-background6 bg-background3"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoadingDetail}
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
              ? "Actualizar permiso"
              : "Crear permiso"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
