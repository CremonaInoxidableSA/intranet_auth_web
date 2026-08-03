"use client"

import { useState } from "react"
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
import { TextScrollArea } from "@/components/components"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import SeleccionarModulos from "../(table)/seleccionarModulos"
import SeleccionarPermisos from "../(table)/seleccionarPermisos"
import SeleccionarSubmodulos from "../(table)/seleccionarSubmodulos"

type Props = {
  onGrupoCreated: () => void
}

export default function FormGrupo({ onGrupoCreated }: Props) {
  const [nombreGrupo, setNombreGrupo] = useState("")
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>(
    []
  )
  const [modulosSeleccionados, setModulosSeleccionados] = useState<string[]>([])
  const [submodulosSeleccionados, setSubmodulosSeleccionados] = useState<
    string[]
  >([])

  const handleSubmit = async () => {
    if (!nombreGrupo.trim()) {
      toast.error("El nombre del grupo es obligatorio")
      return
    }

    const payload = {
      nombre: nombreGrupo.trim(),
      permisos: permisosSeleccionados,
      modulos: modulosSeleccionados,
      submodulos: submodulosSeleccionados,
    }

    try {
      const res = await fetchWithKeycloak("/api/permisos/grupos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || data?.detail || "Error al crear grupo")
        return
      }

      toast.success("Grupo creado correctamente")
      onGrupoCreated()
    } catch {
      toast.error("Error de conexión con la API")
    }
  }

  return (
    <DialogContent className="z-800 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>Crear Grupo</DialogTitle>
        <DialogDescription>
          Complete los datos para crear un nuevo grupo.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="grupo">Nombre del Grupo</Label>
          <Input
            id="grupo"
            value={nombreGrupo}
            onChange={(e) => setNombreGrupo(e.target.value)}
            placeholder="Asigne un nombre único para este grupo"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Permisos</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
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
                <Button type="button" variant="outline" size="sm">
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
        <Button onClick={handleSubmit}>Crear Grupo</Button>
      </DialogFooter>
    </DialogContent>
  )
}
