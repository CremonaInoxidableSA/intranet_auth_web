"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  onUserCreated: () => void
  currentUserId?: number
  userIdToEdit?: number
}

type UserForm = {
  id_usuario: number
  email: string
  username: string
  nombre: string
  apellido: string
  legajo: string
  dni: string
  rol: string
  password: string
}

const roleNameToRolId: Record<string, string> = {
  superadmin: "1",
  admin: "1",
  user: "2",
}

const normalizeRoleValue = (role: unknown): string => {
  if (typeof role === "number") return String(role)
  if (typeof role === "string") {
    if (/^\d+$/.test(role)) return role
    return roleNameToRolId[role] ?? ""
  }
  return ""
}

export default function EditarUsuario({
  onUserCreated,
  currentUserId,
  userIdToEdit,
}: Props) {
  const [loading, setLoading] = useState(userIdToEdit !== undefined)
  const [form, setForm] = useState<UserForm>({
    id_usuario: userIdToEdit ?? 0,
    email: "",
    username: "",
    nombre: "",
    apellido: "",
    legajo: "",
    dni: "",
    rol: "",
    password: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      if (userIdToEdit === undefined || currentUserId === undefined) return

      setLoading(true)

      try {
        const res = await fetch("/api/usuarios/data_usuario", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_user_id: currentUserId,
            id: userIdToEdit,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          alert(data.detail || "Error al cargar datos de usuario")
          return
        }

        setForm({
          id_usuario: data.id ?? userIdToEdit,
          email: data.email ?? "",
          username: data.username ?? "",
          nombre: data.nombre ?? "",
          apellido: data.apellido ?? "",
          legajo: String(data.legajo ?? ""),
          dni: String(data.dni ?? ""),
          rol:
            Array.isArray(data.roles) && data.roles.length > 0
              ? normalizeRoleValue(data.roles[0])
              : "",
          password: "",
        })
      } catch (error) {
        console.error(error)
        alert("Error de conexión con la API")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [currentUserId, userIdToEdit])

  const handleChange = (key: keyof UserForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (currentUserId === undefined || userIdToEdit === undefined) {
      alert("No se pudo editar el usuario")
      return
    }

    if (!form.email.includes("@")) {
      alert("Correo electrónico inválido")
      return
    }

    if (!form.rol) {
      alert("Seleccione un rol")
      return
    }

    const payload: Record<string, unknown> = {
      current_user_id: currentUserId,
      id_usuario: form.id_usuario,
      nombre: form.nombre,
      apellido: form.apellido,
      legajo: Number(form.legajo),
      dni: Number(form.dni),
      email: form.email,
      username: form.username,
      rol_ids: [Number(form.rol)],
    }

    if (form.password.trim() !== "") {
      payload.password = form.password
    }

    try {
      const res = await fetch("/api/usuarios/crear_o_editar_usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.detail || "Error al editar usuario")
        return
      }

      onUserCreated()
    } catch (error) {
      console.error(error)
      alert("Error de conexión con la API")
    }
  }

  if (loading) {
    return (
      <DialogContent className="z-800 bg-background3 sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Cargando...</DialogTitle>
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
        <DialogTitle>Editar Usuario</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="Ingrese el correo electrónico del usuario"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="Asigne un usuario único"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2 xl:grid-cols-2 xl:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Ingrese el nombre del usuario"
              required
              className="border border-background6 bg-background3"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="surname">Apellido</Label>
            <Input
              id="surname"
              value={form.apellido}
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
              value={form.legajo}
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
              value={form.dni}
              onChange={(e) => handleChange("dni", e.target.value)}
              placeholder="Ingrese el DNI"
              className="border border-background6 bg-background3"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Rol</Label>
          <Select
            value={form.rol}
            onValueChange={(value) => handleChange("rol", value)}
          >
            <SelectTrigger className="w-full border border-background6 bg-background3">
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-900">
              <SelectItem value="1">Administrador</SelectItem>
              <SelectItem value="2">Usuario</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="border border-background6 bg-background3"
            placeholder="Dejar vacío para mantener la contraseña actual"
          />
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
