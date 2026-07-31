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
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import { UsersData } from "@/types/types"
import { TextScrollArea } from "@/components/components"
import SeleccionarGrupos from "./seleccionarGrupos"

type Props = {
  onUserCreated: () => void
  userIdToEdit?: string
}

export default function EditarUsuario({ onUserCreated, userIdToEdit }: Props) {
  const [loading, setLoading] = useState(userIdToEdit !== undefined)
  const [gruposSeleccionados, setGruposSeleccionados] = useState<string[]>([])
  const [cambiarContrasena, setCambiarContrasena] = useState(false)

  const [form, setForm] = useState<
    UsersData<{ id: string; habilitado: boolean; cambiar_contraseña: boolean }>
  >({
    email: "",
    nombre: "",
    apellido: "",
    legajo: undefined,
    dni: undefined,
    grupos: [],
    extra: {
      id: userIdToEdit ?? "",
      habilitado: false,
      cambiar_contraseña: false,
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userIdToEdit) return

      setLoading(true)
      try {
        const res = await fetchWithKeycloak(
          `/api/usuarios/detalles?user_id=${userIdToEdit}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        )

        const data = await res.json()
        if (!res.ok) {
          toast.error(data.detail || "Error al cargar datos de usuario")
          return
        }

        setForm({
          email: data.email ?? "",
          nombre: data.nombre ?? "",
          apellido: data.apellido ?? "",
          legajo: data.legajo ?? undefined,
          dni: data.dni ?? undefined,
          grupos: data.grupos ?? [],
          extra: {
            id: data.id ?? userIdToEdit,
            habilitado: data.habilitado ?? false,
            cambiar_contraseña: data.cambiar_contraseña ?? false,
          },
        })
        setGruposSeleccionados(data.grupos ?? [])
        setCambiarContrasena(data.cambiar_contraseña ?? false)
      } catch {
        toast.error("Error de conexión con la API")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userIdToEdit])

  const handleChange = (
    key: keyof Omit<
      UsersData<{
        id: string
        habilitado: boolean
        cambiar_contraseña: boolean
      }>,
      "extra" | "grupos"
    >,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!userIdToEdit) {
      toast.error("No se pudo editar el usuario")
      return
    }

    if (!form?.email?.includes("@")) {
      toast.error("Correo electrónico inválido")
      return
    }

    const payload = {
      email: form.email,
      nombre: form.nombre,
      apellido: form.apellido,
      legajo: Number(form.legajo),
      dni: Number(form.dni),
      grupos: gruposSeleccionados,
      cambiar_contraseña: cambiarContrasena,
    }

    try {
      const res = await fetchWithKeycloak(
        `/api/usuarios/editar?user_id=${userIdToEdit}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.detail || "Error al editar usuario")
        return
      }

      toast.success("Usuario actualizado correctamente")
      onUserCreated()
    } catch {
      toast.error("Error de conexión con la API")
    }
  }

  useEffect(() => {
    if (!loading && userIdToEdit) {
      const input = document.getElementById("email")
      if (input) setTimeout(() => input.focus(), 100)
    }
  }, [loading, userIdToEdit])

  if (loading) {
    return (
      <DialogContent className="z-800 bg-background3 sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Cargando...</DialogTitle>
          <DialogDescription>
            Espere mientras cargan los datos del usuario.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-8">
          <p>Cargando...</p>
        </div>
      </DialogContent>
    )
  }

  return (
    <DialogContent className="z-800 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>Editar usuario</DialogTitle>
        <DialogDescription>
          Complete los datos a editar del usuario seleccionado.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        {/* Campos no editables (solo lectura) */}
        <div className="flex flex-col gap-4">
          <div className="gap-1">
            <Label className="text-sm text-muted-foreground">ID</Label>
            <p className="text-sm font-medium">{form.extra?.id ?? "—"}</p>
          </div>
          <div className="gap-1">
            <Label className="text-sm text-muted-foreground">Habilitado</Label>
            <p className="text-sm font-medium">
              {form.extra?.habilitado ? "Sí" : "No"}
            </p>
          </div>
        </div>

        <hr className="border-background6" />

        {/* Campos editables */}
        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Ingrese el correo electrónico del usuario"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2 xl:grid-cols-2 xl:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={form.nombre ?? ""}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Ingrese el nombre del usuario"
              required
              className="border border-background6 bg-background3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input
              id="apellido"
              value={form.apellido ?? ""}
              onChange={(e) => handleChange("apellido", e.target.value)}
              placeholder="Ingrese el apellido del usuario"
              required
              className="border border-background6 bg-background3"
            />
          </div>
        </div>

        <div className="grid gap-2 xl:grid-cols-2 xl:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="legajo">Legajo</Label>
            <Input
              id="legajo"
              type="number"
              value={form.legajo ?? ""}
              onChange={(e) => handleChange("legajo", e.target.value)}
              placeholder="Ingrese el legajo"
              className="border border-background6 bg-background3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              type="number"
              value={form.dni ?? ""}
              onChange={(e) => handleChange("dni", e.target.value)}
              placeholder="Ingrese el DNI"
              className="border border-background6 bg-background3"
            />
          </div>
        </div>

        {/* Grupos asignados */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Grupos</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  {gruposSeleccionados.length > 0
                    ? "Editar grupos"
                    : "+ Agregar grupos"}
                </Button>
              </DialogTrigger>
              <SeleccionarGrupos
                initialSelected={gruposSeleccionados}
                onSave={setGruposSeleccionados}
              />
            </Dialog>
          </div>
          <TextScrollArea
            tags={gruposSeleccionados}
            extraClass="h-40 rounded border border-background6 bg-background3 p-2"
          />
        </div>

        {/* Checkbox para cambiar contraseña */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="cambiarContrasena"
            checked={cambiarContrasena}
            onCheckedChange={(checked) => setCambiarContrasena(!!checked)}
          />
          <Label htmlFor="cambiarContrasena" className="cursor-pointer">
            Forzar cambio de contraseña en el próximo inicio de sesión
          </Label>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>Guardar cambios</Button>
      </DialogFooter>
    </DialogContent>
  )
}
