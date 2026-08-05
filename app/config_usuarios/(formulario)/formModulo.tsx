"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import { Checkbox } from "@/components/ui/checkbox"
import { ModulosData } from "@/types/types"

type Props = {
  onModuloCreated?: () => void
  isEditing?: boolean
  initialData?: ModulosData
}

export default function FormModulo({
  onModuloCreated,
  isEditing = false,
  initialData,
}: Props) {
  const [form, setForm] = useState({
    nombre: "",
    subdominio: "",
    path: "",
    icono: "",
    habilitado: true,
  })
  const [identifier, setIdentifier] = useState("")
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setForm({
      nombre: initialData?.nombre ?? "",
      subdominio: initialData?.subdominio ?? "",
      path: initialData?.path ?? "",
      icono: initialData?.icono ?? "",
      habilitado: initialData?.habilitado ?? true,
    })
    setIdentifier(initialData?.nombre ?? initialData?.subdominio ?? "")
  }, [initialData])

  useEffect(() => {
    if (!isEditing || !identifier) {
      return
    }

    const loadDetalle = async () => {
      setIsLoadingDetail(true)
      try {
        const response = await fetchWithKeycloak(
          `/api/permisos/modulos/detalle?modulo_nombre=${encodeURIComponent(
            identifier
          )}`
        )

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          toast.error(
            data?.error || data?.detail || "Error al cargar detalle del módulo"
          )
          return
        }

        const data = await response.json()
        setForm({
          nombre: data?.nombre ?? form.nombre,
          subdominio: data?.subdominio ?? form.subdominio,
          path: data?.path ?? form.path,
          icono: data?.icono ?? form.icono,
          habilitado: data?.habilitado ?? form.habilitado,
        })
      } catch {
        toast.error("Error de conexión al cargar detalle del módulo")
      } finally {
        setIsLoadingDetail(false)
      }
    }

    void loadDetalle()
  }, [identifier, isEditing])

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (
      !form.nombre.trim() ||
      !form.subdominio.trim() ||
      !form.path.trim() ||
      !form.icono.trim()
    ) {
      toast.error("Complete todos los campos")
      return
    }

    const recordIdentifier = isEditing
      ? identifier || initialData?.nombre || form.nombre.trim()
      : undefined

    const resolvedIdentifier = recordIdentifier?.trim() || ""

    if (isEditing && !resolvedIdentifier) {
      toast.error("No se pudo identificar el módulo a editar")
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = isEditing
        ? `/api/permisos/modulos/editar?modulo_nombre=${encodeURIComponent(resolvedIdentifier)}`
        : "/api/permisos/modulos/crear"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetchWithKeycloak(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing
            ? {
                subdominio: form.subdominio.trim(),
                path: form.path.trim(),
                icono: form.icono.trim(),
                habilitado: form.habilitado ?? true,
              }
            : {
                nombre: form.nombre.trim(),
                subdominio: form.subdominio.trim(),
                path: form.path.trim(),
                icono: form.icono.trim(),
                habilitado: form.habilitado ?? true,
              }
        ),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || data?.detail || "Error al guardar módulo")
        return
      }

      toast.success(
        isEditing
          ? "Módulo actualizado correctamente"
          : "Módulo creado correctamente"
      )
      onModuloCreated?.()
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
            Espere mientras cargan los datos del módulo.
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
        <DialogTitle>
          {isEditing ? "Editar Módulo" : "Crear Módulo"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Actualice los datos del módulo y guarde los cambios."
            : "Complete los datos para crear un nuevo módulo."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="modulo">Módulo</Label>
          <Input
            id="modulo"
            disabled={isEditing}
            value={form.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Cree un módulo con nombre único"
            required
            className={`border border-background6 bg-background3 ${isEditing ? "cursor-not-allowed" : ""}`}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="submodulos">Subdominio</Label>
          <Input
            id="submodulos"
            value={form.subdominio}
            onChange={(e) => handleChange("subdominio", e.target.value)}
            placeholder="Ingrese el subdominio del módulo"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="path">Path</Label>
          <Input
            id="path"
            value={form.path}
            onChange={(e) => handleChange("path", e.target.value)}
            placeholder="Ingrese el path del módulo"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="icono">Icono</Label>
          <Input
            id="icono"
            value={form.icono}
            onChange={(e) => handleChange("icono", e.target.value)}
            placeholder="Ingrese el icono del módulo"
            required
            className="border border-background6 bg-background3"
          />
        </div>
      </div>

      {!isEditing && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="moduloHabilitado"
            checked={form.habilitado}
            onCheckedChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                habilitado: !!checked,
              }))
            }
          />
          <Label htmlFor="moduloHabilitado" className="cursor-pointer">
            El módulo se creará habilitado y podrá ser accedido. Desmarque esta
            opción para crear un módulo deshabilitado.
          </Label>
        </div>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit} loading={isSubmitting}>
          {isEditing ? "Guardar cambios" : "Crear Módulo"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
