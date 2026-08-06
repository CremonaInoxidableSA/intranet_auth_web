"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  CircleMinus,
  CirclePlus,
  Ellipsis,
  KeyRound,
  PencilLine,
  Trash2,
} from "lucide-react"
import {
  UsersData,
  GruposData,
  ModulosData,
  SubmodulosData,
  PermisosData,
} from "@/types/types"
import { type DataTableColumn } from "./data-table"
import { EditarContraseña } from "../(formulario)/formUsuario"
import { useAutorizacion } from "@/context/useAutorizacion"

function UserActionsCell({
  row,
  onEditUser,
  onDisableUser,
  onEnableUser,
  onDeleteUser,
}: {
  row: UsersData
  onEditUser: (id: string | undefined) => void
  onDisableUser: (id: string) => void
  onEnableUser: (id: string) => void
  onDeleteUser?: (id: string) => void
}) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const id = row.id

  const { autorizacion } = useAutorizacion()

  const puedeEditarUsuario = autorizacion.usuarios.editar
  const puedeHabilitarUsuario = autorizacion.usuarios.habilitar
  const puedeDeshabilitarUsuario = autorizacion.usuarios.deshabilitar
  const puedeCambiarPass = autorizacion.usuarios.cambiarContrasena
  const puedeEliminarUsuario = autorizacion.usuarios.eliminar
  const puedeGestionarUsuario =
    puedeEditarUsuario ||
    puedeHabilitarUsuario ||
    puedeDeshabilitarUsuario ||
    puedeCambiarPass ||
    puedeEliminarUsuario

  if (!puedeGestionarUsuario) {
    return null
  }

  const renderHabilitar = () => {
    if (!puedeHabilitarUsuario) {
      return null
    }

    if (puedeHabilitarUsuario && !row.habilitado) {
      return (
        <DropdownMenuItem asChild>
          <button
            onClick={() => id && onEnableUser(id)}
            className="gap-2 flex w-full cursor-pointer flex-row items-center justify-start text-greencremona"
          >
            <CirclePlus className="h-4 w-4" />
            <span>Habilitar</span>
          </button>
        </DropdownMenuItem>
      )
    }
  }

  const renderDeshabilitar = () => {
    if (!puedeDeshabilitarUsuario) {
      return null
    }

    if (row.habilitado) {
      return (
        <DropdownMenuItem asChild>
          <button
            onClick={() => id && onDisableUser(id)}
            className="flex w-full cursor-pointer flex-row items-center justify-start gap-2 text-redcremona"
          >
            <CircleMinus className="h-4 w-4" />
            <span>Deshabilitar</span>
          </button>
        </DropdownMenuItem>
      )
    }
  }

  const renderEliminar = () => {
    if (!puedeEliminarUsuario) {
      return null
    }

    if (puedeEliminarUsuario) {
      return (
        <DropdownMenuItem asChild>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex w-full cursor-pointer flex-row items-center justify-start text-redcremona"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar</span>
          </button>
        </DropdownMenuItem>
      )
    }
  }

  const renderCambioPass = () => {
    if (!puedeCambiarPass) {
      return null
    }

    if (puedeCambiarPass) {
      return (
        <DropdownMenuItem className="text-left" asChild>
          <button
            onClick={() => setIsPasswordDialogOpen(true)}
            className="flex w-full cursor-pointer flex-row items-center justify-start gap-2 text-orangecremona"
          >
            <KeyRound className="h-4 w-4" />
            <span>Cambiar contraseña</span>
          </button>
        </DropdownMenuItem>
      )
    }
  }

  return (
    <>
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8">
              <span className="sr-only">Abrir menú</span>
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            {puedeEditarUsuario ? (
              <DropdownMenuItem asChild>
                <button
                  onClick={() => onEditUser(id)}
                  className="flex w-full cursor-pointer flex-row items-center justify-start gap-2 text-bluecremona"
                >
                  <PencilLine className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              </DropdownMenuItem>
            ) : null}
            {renderCambioPass()}
            {renderHabilitar()}
            {renderDeshabilitar()}
            {renderEliminar()}
          </DropdownMenuContent>
        </DropdownMenu>
        {id ? (
          <EditarContraseña
            userId={id}
            onPasswordChanged={() => setIsPasswordDialogOpen(false)}
          />
        ) : null}
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              usuario {row.email || id || "seleccionado"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (id) {
                  onDeleteUser?.(id)
                }
                setIsDeleteDialogOpen(false)
              }}
              className="bg-redcremona hover:bg-redcremona/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function GrupoActionsCell({
  row,
  onEditGrupo,
  onDeleteGrupo,
}: {
  row: GruposData
  onEditGrupo: (grupo: GruposData) => void
  onDeleteGrupo: (nombre: string) => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const nombre = row.nombre ?? ""
  const { autorizacion } = useAutorizacion()

  const puedeEditarGrupo = autorizacion.grupos.editar
  const puedeEliminarGrupo = autorizacion.grupos.eliminar

  if (!puedeEditarGrupo && !puedeEliminarGrupo) {
    return null
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8">
            <span className="sr-only">Abrir menú</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {puedeEditarGrupo ? (
            <DropdownMenuItem
              onClick={() => onEditGrupo(row)}
              className="flex cursor-pointer flex-row items-center justify-start gap-2 text-bluecremona"
            >
              <PencilLine className="h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
          ) : null}
          {puedeEliminarGrupo ? (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex cursor-pointer flex-row items-center justify-start gap-2 text-redcremona"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar grupo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el
            grupo {nombre}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => nombre && onDeleteGrupo(nombre)}
            className="bg-redcremona hover:bg-redcremona/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ModuloActionsCell({
  row,
  onEditModulo,
  onDisableModulo,
  onEnableModulo,
  onDeleteModulo,
}: {
  row: ModulosData
  onEditModulo: (modulo: ModulosData) => void
  onDisableModulo: (nombre: string) => void
  onEnableModulo: (nombre: string) => void
  onDeleteModulo: (nombre: string) => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const nombre = row.nombre ?? ""
  const { autorizacion } = useAutorizacion()

  const puedeEditarModulo = autorizacion.modulos.editar
  const puedeDeshabilitarModulo = autorizacion.modulos.deshabilitar
  const puedeHabilitarModulo = autorizacion.modulos.habilitar
  const puedeEliminarModulo = autorizacion.modulos.eliminar

  if (
    !puedeEditarModulo &&
    !puedeDeshabilitarModulo &&
    !puedeHabilitarModulo &&
    !puedeEliminarModulo
  ) {
    return null
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8">
            <span className="sr-only">Abrir menú</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {puedeEditarModulo ? (
            <DropdownMenuItem
              onClick={() => onEditModulo(row)}
              className="flex cursor-pointer flex-row items-center justify-start text-bluecremona"
            >
              <PencilLine className="h-4 w-4" />
              <p className="items-center justify-start">Editar</p>
            </DropdownMenuItem>
          ) : null}
          {row.habilitado && puedeDeshabilitarModulo ? (
            <DropdownMenuItem
              onClick={() => nombre && onDisableModulo(nombre)}
              className="flex-1 cursor-pointer flex-row items-center justify-start text-redcremona"
            >
              <CircleMinus className="h-4 w-4" />
              <p className="items-center justify-start">Deshabilitar</p>
            </DropdownMenuItem>
          ) : null}
          {!row.habilitado && puedeHabilitarModulo ? (
            <DropdownMenuItem
              onClick={() => nombre && onEnableModulo(nombre)}
              className="cursor-pointer flex-row items-center justify-start text-greencremona"
            >
              <CirclePlus className="h-4 w-4" />
              <p className="items-center justify-start">Habilitar</p>
            </DropdownMenuItem>
          ) : null}
          {puedeEliminarModulo ? (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="cursor-pointer flex-row items-center justify-start text-redcremona"
            >
              <Trash2 className="h-4 w-4" />
              <p className="items-center justify-start">Eliminar</p>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar módulo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el
            módulo {nombre}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => nombre && onDeleteModulo(nombre)}
            className="bg-redcremona hover:bg-redcremona/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function SubmoduloActionsCell({
  row,
  onEditSubmodulo,
  onDisableSubmodulo,
  onEnableSubmodulo,
  onDeleteSubmodulo,
}: {
  row: SubmodulosData
  onEditSubmodulo: (submodulo: SubmodulosData) => void
  onDisableSubmodulo: (nombre: string) => void
  onEnableSubmodulo: (nombre: string) => void
  onDeleteSubmodulo: (nombre: string) => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const nombre = row.nombre ?? ""
  const { autorizacion } = useAutorizacion()

  const puedeEditarSubmodulo = autorizacion.submodulos.editar
  const puedeDeshabilitarSubmodulo = autorizacion.submodulos.deshabilitar
  const puedeHabilitarSubmodulo = autorizacion.submodulos.habilitar
  const puedeEliminarSubmodulo = autorizacion.submodulos.eliminar

  if (
    !puedeEditarSubmodulo &&
    !puedeDeshabilitarSubmodulo &&
    !puedeHabilitarSubmodulo &&
    !puedeEliminarSubmodulo
  ) {
    return null
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8">
            <span className="sr-only">Abrir menú</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {puedeEditarSubmodulo ? (
            <DropdownMenuItem
              onClick={() => onEditSubmodulo(row)}
              className="flex cursor-pointer flex-row items-center justify-start text-bluecremona"
            >
              <PencilLine className="h-4 w-4" />
              <p className="items-center justify-start">Editar</p>
            </DropdownMenuItem>
          ) : null}
          {row.habilitado && puedeDeshabilitarSubmodulo ? (
            <DropdownMenuItem
              onClick={() => nombre && onDisableSubmodulo(nombre)}
              className="cursor-pointer flex-row items-center justify-start text-redcremona"
            >
              <CircleMinus className="h-4 w-4" />
              <p className="items-center justify-start">Deshabilitar</p>
            </DropdownMenuItem>
          ) : null}
          {!row.habilitado && puedeHabilitarSubmodulo ? (
            <DropdownMenuItem
              onClick={() => nombre && onEnableSubmodulo(nombre)}
              className="cursor-pointer flex-row items-center justify-start text-greencremona"
            >
              <CirclePlus className="h-4 w-4" />
              <p className="items-center justify-start">Habilitar</p>
            </DropdownMenuItem>
          ) : null}
          {puedeEliminarSubmodulo ? (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="cursor-pointer flex-row items-center justify-start text-redcremona"
            >
              <Trash2 className="h-4 w-4" />
              <p className="items-center justify-start">Eliminar</p>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar submódulo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el
            submódulo {nombre}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => nombre && onDeleteSubmodulo(nombre)}
            className="bg-redcremona hover:bg-redcremona/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const getUsuarioColumns = (
  onEditUser: (id: string | undefined) => void,
  onDisableUser: (id: string) => void,
  onEnableUser: (id: string) => void,
  onDeleteUser?: (id: string) => void,
  showActions = true
): DataTableColumn<UsersData>[] => {
  const columns: DataTableColumn<UsersData>[] = [
    {
      accessorKey: "email",
      header: "Email",
      className: "hidden xl:table-cell",
    },
    {
      header: "Apellido y Nombre",
      cell: ({ row }) => row.apellidoNombre || "—",
    },
    {
      accessorKey: "grupos",
      header: "Grupos",
      className: "hidden xl:table-cell",
      cell: ({ row }) => {
        const grupos = row.grupos?.filter(Boolean) ?? []

        if (!grupos.length) {
          return "—"
        }

        return grupos
          .map((grupo) => {
            if (typeof grupo === "string") {
              return grupo
            }

            return grupo?.nombre ?? ""
          })
          .filter(Boolean)
          .join(", ")
      },
    },
    {
      header: "Habilitado",
      className: "hidden xl:table-cell",
      cell: ({ row }) => (row.habilitado ? "Sí" : "No"),
    },
  ]

  if (showActions) {
    columns.push({
      id: "actions",
      cell: ({ row }) => (
        <UserActionsCell
          row={row}
          onEditUser={onEditUser}
          onDisableUser={onDisableUser}
          onEnableUser={onEnableUser}
          onDeleteUser={onDeleteUser}
        />
      ),
    })
  }

  return columns
}

export const getGrupoColumns = (
  onEditGrupo: (grupo: GruposData) => void,
  onDeleteGrupo: (nombre: string) => void,
  showActions = true
): DataTableColumn<GruposData>[] => {
  const columns: DataTableColumn<GruposData>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      header: "Permisos",
      className: "hidden xl:table-cell",
      cell: () => (
        <p className="items-center justify-start">Editar para ver permisos</p>
      ),
    },
    {
      header: "Modulos",
      className: "hidden xl:table-cell",
      cell: () => (
        <p className="items-center justify-start">Editar para ver modulos</p>
      ),
    },
    {
      header: "Submodulos",
      className: "hidden xl:table-cell",
      cell: () => (
        <p className="items-center justify-start">Editar para ver submodulos</p>
      ),
    },
  ]

  if (showActions) {
    columns.push({
      id: "actions",
      cell: ({ row }) => (
        <GrupoActionsCell
          row={row}
          onEditGrupo={onEditGrupo}
          onDeleteGrupo={onDeleteGrupo}
        />
      ),
    })
  }

  return columns
}

function PermisoActionsCell({
  row,
  onEditPermiso,
  onDeletePermiso,
}: {
  row: PermisosData
  onEditPermiso: (permiso: PermisosData) => void
  onDeletePermiso: (nombre: string) => void
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const nombre = row.nombre ?? ""
  const { autorizacion } = useAutorizacion()

  const puedeEditarPermiso = autorizacion.permisos.editar
  const puedeEliminarPermiso = autorizacion.permisos.eliminar

  if (!puedeEditarPermiso && !puedeEliminarPermiso) {
    return null
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8">
            <span className="sr-only">Abrir menú</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {puedeEditarPermiso ? (
            <DropdownMenuItem
              onClick={() => onEditPermiso(row)}
              className="flex cursor-pointer flex-row items-center justify-start text-bluecremona"
            >
              <PencilLine className="h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
          ) : null}
          {puedeEliminarPermiso ? (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="cursor-pointer flex-row items-center justify-start text-redcremona"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar permiso?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el
            permiso {nombre}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => nombre && onDeletePermiso(nombre)}
            className="bg-redcremona hover:bg-redcremona/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const getPermisoColumns = (
  onEditPermiso: (permiso: PermisosData) => void,
  onDeletePermiso: (nombre: string) => void,
  showActions = true
): DataTableColumn<PermisosData>[] => {
  const columns: DataTableColumn<PermisosData>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
  ]

  if (showActions) {
    columns.push({
      id: "actions",
      cell: ({ row }) => (
        <PermisoActionsCell
          row={row}
          onEditPermiso={onEditPermiso}
          onDeletePermiso={onDeletePermiso}
        />
      ),
    })
  }

  return columns
}

export const getModuloColumns = (
  onEditModulo: (modulo: ModulosData) => void,
  onDisableModulo: (nombre: string) => void,
  onEnableModulo: (nombre: string) => void,
  onDeleteModulo: (nombre: string) => void,
  showActions = true
): DataTableColumn<ModulosData>[] => {
  const columns: DataTableColumn<ModulosData>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      header: "URL",
      className: "hidden xl:table-cell",
      cell: ({ row }) => (
        <p className="items-center justify-start">
          {row.subdominio ? `${row.subdominio}` : "—"}
        </p>
      ),
    },
    {
      header: "Submodulos",
      className: "hidden xl:table-cell",
      cell: () => (
        <p className="items-center justify-start">Editar para ver submodulos</p>
      ),
    },
    {
      header: "Habilitado",
      cell: ({ row }) => (row.habilitado ? "Sí" : "No"),
    },
  ]

  if (showActions) {
    columns.push({
      id: "actions",
      cell: ({ row }) => (
        <ModuloActionsCell
          row={row}
          onEditModulo={onEditModulo}
          onDisableModulo={onDisableModulo}
          onEnableModulo={onEnableModulo}
          onDeleteModulo={onDeleteModulo}
        />
      ),
    })
  }

  return columns
}

export const getSubmoduloColumns = (
  onEditSubmodulo: (submodulo: SubmodulosData) => void,
  onDisableSubmodulo: (nombre: string) => void,
  onEnableSubmodulo: (nombre: string) => void,
  onDeleteSubmodulo: (nombre: string) => void,
  showActions = true
): DataTableColumn<SubmodulosData>[] => {
  const columns: DataTableColumn<SubmodulosData>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      header: "URL",
      className: "hidden xl:table-cell",
      cell: ({ row }) => (
        <p className="items-center justify-start">
          {row.path ? `${row.path}` : "—"}
        </p>
      ),
    },
    {
      header: "Modulo Principal",
      className: "hidden xl:table-cell",
      cell: ({ row }) => (
        <p className="items-center justify-start">
          {row.modulo_padre ? `${row.modulo_padre}` : "—"}
        </p>
      ),
    },
    {
      header: "Habilitado",
      cell: ({ row }) => (row.habilitado ? "Sí" : "No"),
    },
  ]

  if (showActions) {
    columns.push({
      id: "actions",
      cell: ({ row }) => (
        <SubmoduloActionsCell
          row={row}
          onEditSubmodulo={onEditSubmodulo}
          onDisableSubmodulo={onDisableSubmodulo}
          onEnableSubmodulo={onEnableSubmodulo}
          onDeleteSubmodulo={onDeleteSubmodulo}
        />
      ),
    })
  }

  return columns
}
