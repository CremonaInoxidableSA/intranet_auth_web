"use client"

import { useCallback, useEffect, useState } from "react"
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
import SeleccionarGrupos from "../(table)/seleccionarGrupos"
import { CircleMinus, CirclePlus } from "lucide-react"

type Props = {
  onUserCreated: () => void
  userIdToEdit?: string
  onDisableUser?: (userId: string) => void
  onEnableUser?: (userId: string) => void
}

const getEmptyForm = (userId?: string) => ({
  email: "",
  nombre: "",
  apellido: "",
  legajo: undefined,
  dni: undefined,
  grupos: [],
  extra: {
    id: userId ?? "",
    habilitado: false,
    cambiar_contraseña: false,
    password: "",
  },
})

export function EditarUsuario({
  onUserCreated,
  userIdToEdit,
  onDisableUser,
  onEnableUser,
}: Props) {
  const isEditing = Boolean(userIdToEdit)
  const [loading, setLoading] = useState(isEditing)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStatusUpdating, setIsStatusUpdating] = useState(false)
  const [gruposSeleccionados, setGruposSeleccionados] = useState<string[]>([])
  const [cambiarContrasena, setCambiarContrasena] = useState(false)
  const [usuarioHabilitado, setUsuarioHabilitado] = useState(true)

  const [form, setForm] = useState<
    UsersData<{
      id: string
      habilitado: boolean
      cambiar_contraseña: boolean
      password: string
    }>
  >(getEmptyForm(userIdToEdit))

  const loadUserData = useCallback(
    async (showLoading = false) => {
      if (!userIdToEdit) {
        setForm(getEmptyForm())
        setGruposSeleccionados([])
        setCambiarContrasena(false)
        setLoading(false)
        return
      }

      if (showLoading) {
        setLoading(true)
      }

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
            password: data.password ?? "",
          },
        })
        setGruposSeleccionados(data.grupos ?? [])
        setCambiarContrasena(data.cambiar_contraseña ?? false)
        setUsuarioHabilitado(data.habilitado ?? false)
      } catch {
        toast.error("Error de conexión con la API")
      } finally {
        if (showLoading) {
          setLoading(false)
        }
      }
    },
    [userIdToEdit]
  )

  useEffect(() => {
    void loadUserData(true)
  }, [loadUserData])

  const handleChange = (
    key: keyof Omit<
      UsersData<{
        id: string
        habilitado: boolean
        cambiar_contraseña: boolean
        password: string
      }>,
      "extra" | "grupos"
    >,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleStatusToggle = async () => {
    if (!form.extra?.id) return

    setIsStatusUpdating(true)

    try {
      if (form.extra.habilitado) {
        await onDisableUser?.(form.extra.id)
      } else {
        await onEnableUser?.(form.extra.id)
      }

      await loadUserData(false)
      toast.success(
        form.extra.habilitado
          ? "Usuario deshabilitado correctamente"
          : "Usuario habilitado correctamente"
      )
    } catch {
      toast.error("Error de conexión con la API")
    } finally {
      setIsStatusUpdating(false)
    }
  }

  const handleSubmit = async () => {
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
      password: form.extra?.password,
      habilitado: form.extra?.habilitado ?? true,
    }

    setIsSubmitting(true)

    try {
      const endpoint = isEditing
        ? `/api/usuarios/editar?user_id=${userIdToEdit}`
        : "/api/usuarios/crear"

      const res = await fetchWithKeycloak(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.detail || data?.error || "Error al guardar usuario")
        return
      }

      toast.success(
        isEditing
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      )
      onUserCreated()
    } catch {
      toast.error("Error de conexión con la API")
    } finally {
      setIsSubmitting(false)
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
      <DialogContent className="z-100 bg-background3 sm:max-w-150">
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
    <DialogContent className="z-100 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar usuario" : "Crear usuario"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Complete los datos a editar del usuario seleccionado."
            : "Complete los datos para crear un nuevo usuario."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        {isEditing && (
          <>
            {/* Campos no editables (solo lectura) */}
            <div className="flex flex-col gap-4">
              <div className="gap-1">
                <Label htmlFor="id" className="text-sm text-muted-foreground">
                  ID
                </Label>
                <p className="text-sm font-medium">{form.extra?.id ?? "—"}</p>
              </div>
              <div className="gap-1">
                <Label
                  htmlFor="habilitado"
                  className="text-sm text-muted-foreground"
                >
                  Habilitado
                </Label>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {form.extra?.habilitado ? "Sí" : "No"}
                  </p>
                  {form.extra?.habilitado ? (
                    <Button
                      loading={isStatusUpdating}
                      loadingText="Deshabilitando..."
                      onClick={() => {
                        void handleStatusToggle()
                      }}
                      className="flex cursor-pointer items-center border border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/70"
                    >
                      <CircleMinus className="h-4 w-4" />
                      Deshabilitar
                    </Button>
                  ) : (
                    <Button
                      loading={isStatusUpdating}
                      loadingText="Habilitando..."
                      onClick={() => {
                        void handleStatusToggle()
                      }}
                      className="flex cursor-pointer items-center border border-greencremona bg-greencremona/20 text-greencremona hover:bg-greencremona/70"
                    >
                      <CirclePlus className="h-4 w-4" />
                      Habilitar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-background6" />
          </>
        )}

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
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="usuarioHabilitado"
              checked={usuarioHabilitado}
              onCheckedChange={(checked) => setUsuarioHabilitado(!!checked)}
            />
            <Label htmlFor="usuarioHabilitado" className="cursor-pointer">
              El usuario se creara habilitado y podrá iniciar sesión. Desmarque
              esta opción para crear un usuario deshabilitado.
            </Label>
          </div>
        )}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit} loading={isSubmitting}>
          {isEditing ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export function EditarContraseña({
  userId,
  onPasswordChanged,
}: {
  userId: string
  onPasswordChanged: () => void
}) {
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!password || !passwordConfirmation) {
      toast.error("Complete la contraseña y su confirmación")
      return
    }

    if (password !== passwordConfirmation) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetchWithKeycloak("/api/usuarios/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(
          data?.detail || data?.error || "Error al cambiar la contraseña"
        )
        return
      }

      toast.success("Contraseña actualizada correctamente")
      setPassword("")
      setPasswordConfirmation("")
      onPasswordChanged()
    } catch {
      toast.error("Error de conexión con la API")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="z-100 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>Editar contraseña</DialogTitle>
        <DialogDescription>
          Complete los datos para cambiar la contraseña del usuario.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingrese la nueva contraseña"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password_confirmation">
            Confirmar nueva contraseña
          </Label>
          <Input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            placeholder="Confirme la nueva contraseña"
            required
            className="border border-background6 bg-background3"
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button
          onClick={() => {
            void handleSubmit()
          }}
          loading={isSubmitting}
        >
          Cambiar contraseña
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
