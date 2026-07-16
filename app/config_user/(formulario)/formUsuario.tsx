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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
  onUserCreated: () => void
}

export default function FormUsuario({ onUserCreated }: Props) {
  const [form, setForm] = useState({
    id: 0,
    email: "",
    username: "",
    nombre: "",
    apellido: "",
    legajo: "",
    dni: "",
    rol: "",
    password: "",
    reporte: true,
    habilitado: 1,
  })

  const handleChange = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.email.includes("@")) {
      alert("Correo electrónico inválido")
      return
    }

    if (!form.legajo) {
      alert("Legajo es obligatorio")
      return
    }

    if (!form.dni) {
      alert("DNI es obligatorio")
      return
    }

    if (!form.rol) {
      alert("Seleccione un rol")
      return
    }

    if (!form.password) {
      alert("Contraseña es obligatoria")
      return
    }

    const payload = {
      id_usuario: 0,
      nombre: form.nombre,
      apellido: form.apellido,
      legajo: Number(form.legajo),
      dni: Number(form.dni),
      email: form.email,
      rol_ids: [Number(form.rol)],
      username: form.username,
      password: form.password,
    }

    const res = await fetch(`/api/usuarios/crear_o_editar_usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.detail || "Error al crear usuario")
      return
    }

    onUserCreated()
  }

  return (
    <DialogContent className="z-800 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>Crear Usuario</DialogTitle>
        <DialogDescription>
          Complete los datos para crear un nuevo usuario.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
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
              required
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
              required
              className="border border-background6 bg-background3"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Rol</Label>
          <Select onValueChange={(v) => handleChange("rol", v)}>
            <SelectTrigger className="w-full border border-background6 bg-background3">
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-900">
              <SelectGroup>
                <SelectLabel>Rol</SelectLabel>
                <SelectItem value="1">Administrador</SelectItem>
                <SelectItem value="2">Usuario</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="border border-background6 bg-background3"
          placeholder="Ingrese la contraseña del usuario"
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>Crear Usuario</Button>
      </DialogFooter>
    </DialogContent>
  )
}
