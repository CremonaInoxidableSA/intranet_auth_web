"use client"

import { useEffect, useMemo, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

import FormUsuario from "./(formulario)/formUsuario"
import FormRol from "./(formulario)/formRol"
import FormModulo from "./(formulario)/formModulo"
import EditarUsuario from "./(table)/editarUsuario"

import { columns as userColumns, User } from "./(table)/columns"
import { DataTable, type DataTableColumn } from "./(table)/data-table"

import { useAuth } from "@/context/AuthProvider"

import { Boton, TabsComp } from "@/components/components"

import { fetchUsuarios } from "./(data)/usuarios"
import { fetchRoles, type Role } from "./(data)/roles"
import { fetchModulos, type Modulo } from "./(data)/modulos"
import { fetchSubmodulos, type Submodulo } from "./(data)/submodulos"

const TAB_USUARIOS = 1
const TAB_ROLES = 2
const TAB_MODULOS = 3
const TAB_SUBMODULOS = 4

const tablas = [
  {
    id: TAB_USUARIOS,
    nombre: "Lista de Usuarios",
  },
  {
    id: TAB_ROLES,
    nombre: "Lista de Roles",
  },
  {
    id: TAB_MODULOS,
    nombre: "Lista de Modulos",
  },
  {
    id: TAB_SUBMODULOS,
    nombre: "Lista de Submodulos",
  },
]

const roleColumns: DataTableColumn<Role>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "rol",
    header: "Rol",
    cell: ({ row }) => String(row.rol ?? row.nombre ?? "—"),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
]

const moduloColumns: DataTableColumn<Modulo>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nombre",
    header: "Módulo",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
]

const submoduloColumns: DataTableColumn<Submodulo>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "nombre",
    header: "Submódulo",
  },
  {
    accessorKey: "modulo",
    header: "Módulo",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
]

export default function ConfiguracionUsuario() {
  const { user } = useAuth()
  const [selectedTabId, setSelectedTabId] = useState(tablas[0].id)
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userToEdit, setUserToEdit] = useState<string | null>(null)
  const [userIdToEdit, setUserIdToEdit] = useState<number | undefined>(
    undefined
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const createHeaders = (tabId: number): Record<string, string> => {
    if (tabId === TAB_USUARIOS) {
      return { "Content-Type": "application/json" }
    }

    return { Accept: "application/json" }
  }

  const currentHeaders = useMemo(
    () => createHeaders(selectedTabId),
    [selectedTabId]
  )

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        switch (selectedTabId) {
          case TAB_USUARIOS: {
            const users = await fetchUsuarios(user?.id, currentHeaders)
            if (!mounted) return
            setData(users)
            break
          }
          case TAB_ROLES: {
            const roles = await fetchRoles(currentHeaders)
            if (!mounted) return
            setData(roles)
            break
          }
          case TAB_MODULOS: {
            const modulos = await fetchModulos(currentHeaders)
            if (!mounted) return
            setData(modulos)
            break
          }
          case TAB_SUBMODULOS: {
            const submodulos = await fetchSubmodulos(currentHeaders)
            if (!mounted) return
            setData(submodulos)
            break
          }
          default:
            if (!mounted) return
            setData([])
        }
      } catch (error) {
        if (!mounted) return
        setError("Error al cargar los datos")
        setData([])
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [selectedTabId, user?.id, currentHeaders])

  const refetchUsuarios = async () => {
    if (selectedTabId !== TAB_USUARIOS) return
    const users = await fetchUsuarios(user?.id, currentHeaders)
    setData(users)
  }

  const deshabilitarUsuario = async (usuario_id: number) => {
    try {
      const res = await fetch("/api/usuarios/deshabilitar_usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_user_id: user?.id,
          usuario_id,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result.detail || "Error al deshabilitar el usuario")
        return
      }

      setData((prev) =>
        prev.map((u) =>
          (u as User).id === usuario_id ? { ...(u as User), habilitado: 0 } : u
        )
      )
    } catch {
      alert("Error de conexión con la API")
    }
  }

  const habilitarUsuario = async (usuario_id: number) => {
    const res = await fetch("/api/usuarios/habilitar_usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_user_id: user?.id,
        usuario_id,
      }),
    })

    if (!res.ok) return

    setData((prev) =>
      prev.map((u) =>
        (u as User).id === usuario_id ? { ...(u as User), habilitado: 1 } : u
      )
    )
  }

  const eliminarUsuario = async (usuario_id: number) => {
    const confirmar = confirm(
      "¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer."
    )

    if (!confirmar) return

    try {
      const res = await fetch("/api/proxy/auth/eliminar_usuario", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_user_id: user?.id,
          usuario_id,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result.detail || "Error al eliminar el usuario")
        return
      }

      setData((prev) => prev.filter((u) => (u as User).id !== usuario_id))
    } catch {
      alert("Error de conexión con la API")
    }
  }

  const editarUsuario = (id: number | undefined, username: string) => {
    setUserIdToEdit(id)
    setUserToEdit(username)
    setIsEditDialogOpen(true)
  }

  const currentColumns = useMemo<
    DataTableColumn<Record<string, unknown>>[]
  >(() => {
    switch (selectedTabId) {
      case TAB_ROLES:
        return roleColumns as DataTableColumn<Record<string, unknown>>[]
      case TAB_MODULOS:
        return moduloColumns as DataTableColumn<Record<string, unknown>>[]
      case TAB_SUBMODULOS:
        return submoduloColumns as DataTableColumn<Record<string, unknown>>[]
      default:
        return userColumns(
          editarUsuario,
          deshabilitarUsuario,
          habilitarUsuario,
          eliminarUsuario
        ) as DataTableColumn<Record<string, unknown>>[]
    }
  }, [selectedTabId])

  const handleUserUpdated = () => {
    setIsEditDialogOpen(false)
    setUserToEdit(null)
    setUserIdToEdit(undefined)
    refetchUsuarios()
  }

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
                Agregar Submodulo
              </Boton>
            </DialogTrigger>
            <FormModulo />
          </Dialog>
        </div>
      </section>

      <div className="flex flex-1 flex-col items-center gap-5">
        <TabsComp
          data={tablas}
          extraClass="text-2xl"
          value={String(selectedTabId)}
          onValueChange={(value) => setSelectedTabId(Number(value))}
        />

        {isLoading ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Cargando...</span>
          </div>
        ) : (
          <div className="w-full">
            {error ? (
              <div className="rounded border border-red-500 bg-red-100 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <DataTable
              key={selectedTabId}
              columns={currentColumns}
              extraClass="w-full"
              data={data}
            />
          </div>
        )}
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
