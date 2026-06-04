"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/app/api/api";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onUserCreated: () => void;
  usernameToEdit?: string;
  userIdToEdit?: number;
};

export default function FormUsuario({
  onUserCreated,
  usernameToEdit,
  userIdToEdit,
}: Props) {
  const [loading, setLoading] = useState(!!usernameToEdit);
  const [form, setForm] = useState({
    id: userIdToEdit || undefined,
    email: "",
    username: "",
    nombre: "",
    apellido: "",
    rol: "",
    password: "",
    reporte: true,
    habilitado: 1,
  });

  const isEditing = !!usernameToEdit;

  useEffect(() => {
    if (!usernameToEdit) return;

    const fetchUserData = async () => {
      try {
        const res = await authFetch(
          `/api/proxy/auth/data_usuario/${usernameToEdit}`,
          { method: "GET" },
        );

        if (!res.ok) {
          throw new Error("Error al cargar datos del usuario");
        }

        const data = await res.json();
        setForm({
          id: data.id || userIdToEdit,
          email: data.email,
          username: data.username,
          nombre: data.nombre,
          apellido: data.apellido,
          rol: data.rol,
          password: "",
          reporte: data.reporte,
          habilitado: data.habilitado,
        });
      } catch {
        alert("Error al cargar usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [usernameToEdit, userIdToEdit]);

  const handleChange = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.email.includes("@")) {
      alert("Correo electrónico inválido");
      return;
    }

    if (!isEditing && !form.password) {
      alert("Contraseña requerida");
      return;
    }

    const payload = {
      ...form,
      habilitado: form.habilitado ? 1 : 0,
      password: isEditing && !form.password ? undefined : form.password,
    };

    const endpoint = isEditing ? "/editar_usuario" : "/crear_usuario";
    const res = await authFetch(`/api/proxy/auth${endpoint}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(
        err.detail ||
          (isEditing ? "Error al editar usuario" : "Error al crear usuario"),
      );
      return;
    }

    onUserCreated();
  };

  if (loading) {
    return (
      <DialogContent className="sm:max-w-150 bg-background3 z-800">
        <DialogHeader>
          <DialogTitle>Cargando...</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center py-8">
          <p>Cargando...</p>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="sm:max-w-150 bg-background2 z-800">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Usuario" : "Crear Usuario"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Modifique los datos del usuario"
            : "Complete los datos para crear un nuevo usuario"}
        </DialogDescription>
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
            className="bg-background3 border border-background6"
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
            className="bg-background3 border border-background6"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={form.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Ingrese el nombre del usuario"
            required
            className="bg-background3 border border-background6"
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
            className="bg-background3 border border-background6"
          />
        </div>

        <div className="grid gap-2">
          <Label>Rol</Label>
          <Select
            value={form.rol}
            onValueChange={(v) => handleChange("rol", v)}
          >
            <SelectTrigger className="w-full bg-background3 border border-background6">
              <SelectValue placeholder="Seleccione un rol" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-900">
              <SelectGroup>
                <SelectLabel>Rol</SelectLabel>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">
          Contraseña{" "}
          {isEditing && `(Opcional, dejar vacío para mantener la actual)`}
        </Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          className="bg-background3 border border-background6"
          placeholder={
            isEditing
              ? "Dejar vacío para mantener la contraseña actual"
              : "Ingrese la contraseña del usuario"
          }
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>
          {isEditing ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
