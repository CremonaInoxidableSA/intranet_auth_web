"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/app/api/api"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { UserAvatar } from "@/components/userIcon/userAvatar"

import FormUsuario from "./(formulario)/formUsuario"
import FormRol from "./(formulario)/formRol"
import FormModulo from "./(formulario)/formModulo"
import EditarUsuario from "./(table)/editarUsuario"

import { columns, User } from "./(table)/columns"
import { DataTable } from "./(table)/data-table"

import { useAuth } from "@/context/AuthProvider"

export default function ConfiguracionUsuario() {
  const normalizeUsers = (users: unknown): User[] => {
    if (Array.isArray(users)) return users
    if (users && typeof users === "object") {
      const maybeData = (users as { data?: unknown }).data
      if (Array.isArray(maybeData)) return maybeData
    }
    return []
  }

  const refetchUsuarios = async () => {
    const res = await authFetch(`/api/proxy/auth/usuarios`)
    const users = await res.json()
    setData(normalizeUsers(users))
  }

  const deshabilitarUsuario = async (username: string) => {
    try {
      const res = await authFetch(`/api/proxy/auth/deshabilitar_usuario`, {
        method: "POST",
        body: JSON.stringify({ username }),
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result.detail || "Error al deshabilitar el usuario")
        return
      }

      setData((prev) =>
        prev.map((u) => (u.username === username ? { ...u, habilitado: 0 } : u))
      )
    } catch {
      alert("Error de conexión con la API")
    }
  }

  const habilitarUsuario = async (username: string) => {
    const res = await authFetch(`/api/proxy/auth/habilitar_usuario`, {
      method: "POST",
      body: JSON.stringify({ username }),
    })

    if (!res.ok) return

    setData((prev: User[]) =>
      prev.map((u: User) =>
        u.username === username ? { ...u, habilitado: 1 } : u
      )
    )
  }

  const eliminarUsuario = async (username: string) => {
    const confirmar = confirm(
      "¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer."
    )

    if (!confirmar) return

    try {
      const res = await authFetch(`/api/proxy/auth/eliminar_usuario`, {
        method: "DELETE",
        body: JSON.stringify({ username }),
      })

      let result: { detail?: string } = {}
      try {
        result = await res.json()
      } catch {
        result = { detail: res.statusText }
      }

      if (!res.ok) {
        alert(result.detail || "Error al eliminar el usuario")
        return
      }

      setData((prev: User[]) =>
        prev.filter((u: User) => u.username !== username)
      )
    } catch {
      alert("Error de conexión con la API")
    }
  }

  const editarUsuario = (id: number | undefined, username: string) => {
    setUserIdToEdit(id)
    setUserToEdit(username)
    setIsEditDialogOpen(true)
  }

  const handleUserUpdated = () => {
    setIsEditDialogOpen(false)
    setUserToEdit(null)
    setUserIdToEdit(undefined)
    refetchUsuarios()
  }

  const { nombre, apellido, email, rol } = useAuth()
  const [data, setData] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userToEdit, setUserToEdit] = useState<string | null>(null)
  const [userIdToEdit, setUserIdToEdit] = useState<number | undefined>(
    undefined
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    authFetch(`/api/proxy/auth/usuarios`)
      .then((res) => res.json())
      .then((users: unknown) => {
        if (mounted) setData(normalizeUsers(users))
      })
      .finally(() => mounted && setIsLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const getRoleName = (role?: string) => {
    const roleMap: Record<string, string> = {
      superadmin: "Superadmin",
      admin: "Admin",
      user: "Usuario",
    }
    return (role && roleMap[role]) || role || "-"
  }

  const fullname = `${nombre ?? ""}${nombre || apellido ? " " : ""}${
    apellido ?? ""
  }`.trim()

  return (
    <div className="flex w-full flex-row gap-5 p-5">
      <div className="flex h-full w-1/5 flex-col justify-start gap-5 self-stretch rounded bg-background2 p-5">
        <div className="flex w-full items-center justify-center">
          <UserAvatar
            nombre={nombre}
            apellido={apellido}
            rol={rol}
            sizeClass="w-20 h-20"
            textClass="text-2xl"
            imgPx={80}
          />
        </div>

        <div className="flex flex-col gap-5 text-left">
          <div>
            <p className="text-xl font-semibold">Nombre</p>
            <p>{fullname || "-"}</p>
          </div>

          <div>
            <p className="text-lg font-semibold">Email</p>
            <p>{email || "-"}</p>
          </div>

          <div>
            <p className="text-lg font-semibold">Rol</p>
            <p>{rol ? getRoleName(rol) : "-"}</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-md h-10 w-full cursor-pointer border border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30">
              Crear Usuario
            </Button>
          </DialogTrigger>
          <FormUsuario onUserCreated={refetchUsuarios} />
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-md h-10 w-full cursor-pointer border border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30">
              Crear Rol
            </Button>
          </DialogTrigger>
          <FormRol />
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="text-md h-10 w-full cursor-pointer border border-greencremona bg-greencremona/20 text-greencremona hover:bg-greencremona/30">
              Agregar Modulo
            </Button>
          </DialogTrigger>
          <FormModulo />
        </Dialog>
      </div>
      <div className="flex h-full w-4/5 flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="flex w-full justify-center text-2xl">
            Lista de Usuarios
          </p>
          {isLoading && (
            <div className="flex items-center gap-2">
              <Spinner />
              <span>Cargando...</span>
            </div>
          )}
        </div>

        <DataTable
          columns={columns(
            editarUsuario,
            deshabilitarUsuario,
            habilitarUsuario,
            eliminarUsuario
          )}
          data={data}
        />

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          {userToEdit && (
            <EditarUsuario
              onUserCreated={handleUserUpdated}
              usernameToEdit={userToEdit}
              userIdToEdit={userIdToEdit}
            />
          )}
        </Dialog>

        <div className="mt-4"></div>
      </div>
    </div>
  )
}
