"use client"

import { useEffect, useMemo, useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import FormUsuario from "./(formulario)/formUsuario"
import FormRol from "./(formulario)/formRol"
import FormModulo from "./(formulario)/formModulo"
import FormSubmodulo from "./(formulario)/formSubmodulo"
import EditarUsuario from "./(table)/editarUsuario"

import { columns as userColumns, User } from "./(table)/columns"
import { DataTable, type DataTableColumn } from "./(table)/data-table"

import { useAuth } from "@/context/AuthProvider"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"

import { Boton, TabsComp } from "@/components/components"

import { fetchUsuarios } from "./(data)/usuarios"
import { fetchGrupos, type Grupo } from "./(data)/grupos"
import { fetchModulos, type Modulo } from "./(data)/modulos"
import { fetchSubmodulos, type Submodulo } from "./(data)/submodulos"

const TAB_USUARIOS = 1
const TAB_GRUPOS = 2
const TAB_MODULOS = 3
const TAB_SUBMODULOS = 4

const tablas = [
  {
    id: TAB_USUARIOS,
    nombre: "Lista de Usuarios",
  },
  {
    id: TAB_GRUPOS,
    nombre: "Lista de Grupos",
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

const botonesCreacion = [
  {
    id: TAB_USUARIOS,
    nombre: "Crear Usuario",
    extraClass:
      "border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30",
  },
  {
    id: TAB_GRUPOS,
    nombre: "Crear Grupo",
    extraClass:
      "border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30",
  },
  {
    id: TAB_MODULOS,
    nombre: "Agregar Modulo",
    extraClass:
      "border-greencremona bg-greencremona/20 text-greencremona hover:bg-greencremona/30",
  },
  {
    id: TAB_SUBMODULOS,
    nombre: "Agregar Submodulo",
    extraClass:
      "border-orangecremona bg-orangecremona/20 text-orangecremona hover:bg-orangecremona/30",
  },
]

const grupoColumns: DataTableColumn<Grupo>[] = [
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
  const [userIdToEdit, setUserIdToEdit] = useState<string | number | undefined>(
    undefined
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [userPage, setUserPage] = useState(1)
  const [userFilterInput, setUserFilterInput] = useState("")
  const [userFilter, setUserFilter] = useState<string | null>(null)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userTotalUsers, setUserTotalUsers] = useState(0)

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
            const usersResponse = await fetchUsuarios(
              user?.extra?.id,
              {
                numeroPagina: userPage,
                filtro: userFilter,
              },
              currentHeaders
            )
            if (!mounted) return
            setData(usersResponse.users)
            setUserTotalPages(usersResponse.paginacion.total_paginas)
            setUserTotalUsers(usersResponse.paginacion.total_usuarios)
            break
          }
          case TAB_GRUPOS: {
            const grupos = await fetchGrupos(currentHeaders)
            if (!mounted) return
            setData(grupos)
            setUserTotalPages(1)
            setUserTotalUsers(0)
            break
          }
          case TAB_MODULOS: {
            const modulos = await fetchModulos(currentHeaders)
            if (!mounted) return
            setData(modulos)
            setUserTotalPages(1)
            setUserTotalUsers(0)
            break
          }
          case TAB_SUBMODULOS: {
            const submodulos = await fetchSubmodulos(currentHeaders)
            if (!mounted) return
            setData(submodulos)
            setUserTotalPages(1)
            setUserTotalUsers(0)
            break
          }
          default:
            if (!mounted) return
            setData([])
            setUserTotalPages(1)
            setUserTotalUsers(0)
        }
      } catch {
        if (!mounted) return
        setError("Error al cargar los datos")
        setData([])
        setUserTotalPages(1)
        setUserTotalUsers(0)
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [selectedTabId, user?.extra?.id, currentHeaders, userPage, userFilter])

  const refetchUsuarios = async () => {
    if (selectedTabId !== TAB_USUARIOS) return
    const usersResponse = await fetchUsuarios(
      user?.extra?.id,
      {
        numeroPagina: userPage,
        filtro: userFilter,
      },
      currentHeaders
    )
    setData(usersResponse.users)
    setUserTotalPages(usersResponse.paginacion.total_paginas)
    setUserTotalUsers(usersResponse.paginacion.total_usuarios)
  }

  const handleUserCreated = async () => {
    await refetchUsuarios()
    setIsCreateDialogOpen(false)
  }

  const deshabilitarUsuario = async (usuario_id: string | number) => {
    try {
      const res = await fetchWithKeycloak(
        "/api/usuarios/deshabilitar_usuario",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_user_id: user?.extra?.id,
            usuario_id,
          }),
        }
      )

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

  const habilitarUsuario = async (usuario_id: string | number) => {
    const res = await fetchWithKeycloak("/api/usuarios/habilitar-usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_user_id: user?.extra?.id,
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

  const eliminarUsuario = async (usuario_id: string | number) => {
    const confirmar = confirm(
      "¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer."
    )

    if (!confirmar) return

    try {
      const res = await fetchWithKeycloak("/api/usuarios/deshabilitar-usuario", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_user_id: user?.extra?.id,
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

  const editarUsuario = (id: string | number | undefined) => {
    setUserIdToEdit(id)
    setIsEditDialogOpen(true)
  }

  const aplicarFiltroUsuarios = () => {
    setUserPage(1)
    const parsedFiltro = userFilterInput.trim()
    setUserFilter(parsedFiltro === "" ? null : parsedFiltro)
  }

  const limpiarFiltroUsuarios = () => {
    setUserFilterInput("")
    setUserFilter(null)
    setUserPage(1)
  }

  const currentColumns = useMemo<
    DataTableColumn<Record<string, unknown>>[]
  >(() => {
    switch (selectedTabId) {
      case TAB_GRUPOS:
        return grupoColumns as DataTableColumn<Record<string, unknown>>[]
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
    setUserIdToEdit(undefined)
    refetchUsuarios()
  }

  const currentCreateButton = botonesCreacion.find(
    (boton) => boton.id === selectedTabId
  )

  const renderCreateForm = () => {
    switch (selectedTabId) {
      case TAB_USUARIOS:
        return <FormUsuario onUserCreated={handleUserCreated} />
      case TAB_GRUPOS:
        return <FormRol />
      case TAB_MODULOS:
        return <FormModulo />
      case TAB_SUBMODULOS:
        return <FormSubmodulo />
      default:
        return null
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-5 p-5">
      <div className="flex w-full flex-1 flex-col gap-5">
        <div className="flex w-full flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col gap-3 xl:w-auto">
            <div className="hidden xl:block">
              <TabsComp
                data={tablas}
                extraClass="xl:text-xl"
                value={String(selectedTabId)}
                onValueChange={(value) => setSelectedTabId(Number(value))}
              />
            </div>
            <div className="block xl:hidden">
              <label htmlFor="mobile-tab-select" className="sr-only">
                Seleccionar lista
              </label>
              <select
                id="mobile-tab-select"
                value={String(selectedTabId)}
                onChange={(event) =>
                  setSelectedTabId(Number(event.target.value))
                }
                className="w-full rounded border border-background6 bg-background3 px-3 py-2 text-sm text-foreground transition outline-none focus:border-background5"
              >
                {tablas.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Boton
                extraClass={`${
                  currentCreateButton?.extraClass ??
                  "border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
                } w-full xl:w-auto`}
              >
                {currentCreateButton?.nombre ?? "Crear Usuario"}
              </Boton>
            </DialogTrigger>
            {renderCreateForm()}
          </Dialog>
        </div>

        <div className="flex w-full flex-col gap-5">
          {selectedTabId === TAB_USUARIOS && (
            <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col gap-2 xl:max-w-xl xl:flex-row">
                <Input
                  value={userFilterInput}
                  onChange={(event) => setUserFilterInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      aplicarFiltroUsuarios()
                    }
                  }}
                  placeholder="Filtrar por nombre, apellido o email"
                  className="border border-background6 bg-background3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={aplicarFiltroUsuarios}
                    className="border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
                  >
                    Filtrar
                  </Button>
                  <Button
                    onClick={limpiarFiltroUsuarios}
                    className="border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DataTable
            key={selectedTabId}
            columns={currentColumns}
            extraClass="w-full"
            data={data}
            disableClientPagination={selectedTabId === TAB_USUARIOS}
            isLoading={isLoading}
          />
          {selectedTabId === TAB_USUARIOS && (
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <span className="text-sm text-muted-foreground">
                Total usuarios: {userTotalUsers}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-28 text-center text-sm">
                  Página {userPage} de {Math.max(userTotalPages, 1)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={userPage >= Math.max(userTotalPages, 1)}
                  onClick={() =>
                    setUserPage((prev) =>
                      Math.min(prev + 1, Math.max(userTotalPages, 1))
                    )
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {userIdToEdit !== undefined && user?.extra?.id !== undefined && (
          <EditarUsuario
            onUserCreated={handleUserUpdated}
            currentUserId={user?.extra?.id}
            userIdToEdit={userIdToEdit}
          />
        )}
      </Dialog>
    </section>
  )
}
