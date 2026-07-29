"use client"

import { useState } from "react"
import { toast } from "sonner"
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
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

type Props = {
  onUserCreated: () => void
}

export default function FormUsuario({ onUserCreated }: Props) {
  const [form, setForm] = useState({
    email: "",
    nombre: "",
    apellido: "",
    legajo: "",
    dni: "",
    password: "",
    habilitado: true,
  })

  const handleChange = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.email.includes("@")) {
      toast.error("Correo electrónico inválido")
      return
    }

    if (!form.legajo) {
      toast.error("Legajo es obligatorio")
      return
    }

    if (!form.dni) {
      toast.error("DNI es obligatorio")
      return
    }

    if (!form.password) {
      toast.error("Contraseña es obligatoria")
      return
    }

    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      legajo: Number(form.legajo),
      dni: Number(form.dni),
      email: form.email,
      password: form.password,
      habilitado: true,
    }

    const res = await fetchWithKeycloak(
      `/api/usuarios/crear-usuario`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.detail || "Error al crear usuario")
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
