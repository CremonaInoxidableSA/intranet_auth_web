"use client"

import { useState } from "react"
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

type Props = {
  onModuloCreated?: () => void
}

export default function FormModulo({ onModuloCreated }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    subdominio: "",
    path: "",
    icono: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

    setIsSubmitting(true)

    try {
      const res = await fetchWithKeycloak("/api/permisos/modulos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          subdominio: form.subdominio.trim(),
          path: form.path.trim(),
          icono: form.icono.trim(),
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || data?.detail || "Error al crear módulo")
        return
      }

      toast.success("Módulo creado correctamente")
      setForm({ nombre: "", subdominio: "", path: "", icono: "" })
      onModuloCreated?.()
    } catch {
      toast.error("Error de conexión con la API")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="z-100 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>Crear Módulo</DialogTitle>
        <DialogDescription>
          Complete los datos para crear un nuevo módulo.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="modulo">Módulo</Label>
          <Input
            id="modulo"
            value={form.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Cree un módulo con nombre único"
            required
            className="border border-background6 bg-background3"
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

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit} loading={isSubmitting}>
          Crear Módulo
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
