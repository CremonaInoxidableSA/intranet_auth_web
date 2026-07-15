"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/app/api/api"
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

import { Boton, TabsComp } from "@/components/components"

const tablas = [
  {
    id: 1,
    nombre: "Lista de Usuarios",
  },
  {
    id: 2,
    nombre: "Lista de Roles",
  },
  {
    id: 3,
    nombre: "Lista de Modulos",
  },
  {
    id: 4,
    nombre: "Lista de Submodulos",
  },
]

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

  return (
    <section className="flex flex-1 flex-col gap-5 p-5">
      <section className="grid grid-cols-2 items-center gap-5 rounded bg-background2 p-5">
        <div className="flex h-full flex-row items-center justify-end gap-5">
          <Dialog>
            <DialogTrigger asChild>
              <Boton extraClass="border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30 flex-1 h-full">
                Crear Usuario
              </Boton>
            </DialogTrigger>
            <FormUsuario onUserCreated={refetchUsuarios} />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Boton extraClass="border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30 flex-1 h-full">
                Crear Rol
              </Boton>
            </DialogTrigger>
            <FormRol />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Boton extraClass="border-greencremona bg-greencremona/20 text-greencremona hover:bg-greencremona/30 flex-1 h-full">
                Agregar Modulo
              </Boton>
            </DialogTrigger>
            <FormModulo />
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Boton extraClass="border-orangecremona bg-orangecremona/20 text-orangecremona hover:bg-orangecremona/30 flex-1 h-full">
                Agregar Subodulo
              </Boton>
            </DialogTrigger>
            <FormModulo />
          </Dialog>
        </div>
      </section>

      <div className="flex flex-1 flex-col items-center gap-5">
        <TabsComp data={tablas} extraClass="text-2xl" />
        {isLoading && (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Cargando...</span>
          </div>
        )}
        {tablas.map((tabla) => {
          return (
            <DataTable
              columns={columns(
                editarUsuario,
                deshabilitarUsuario,
                habilitarUsuario,
                eliminarUsuario
              )}
              extraClass="w-full"
              data={data}
            />
          )
        })}
        
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {userToEdit && (
          <EditarUsuario
            onUserCreated={handleUserUpdated}
            usernameToEdit={userToEdit}
            userIdToEdit={userIdToEdit}
          />
        )}
      </Dialog>
    </section>
  )
}
