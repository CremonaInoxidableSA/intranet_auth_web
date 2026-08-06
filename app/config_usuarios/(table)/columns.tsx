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
import { useAuth } from "@/context/AuthProvider"
import { usePermisos } from "@/context/usePermisos"
import { PERMISOS } from "@/lib/permisos"

function UserActionsCell({
  row,
  onEditUser,
  onDisableUser,
  onEnableUser,
}: {
  row: UsersData
  onEditUser: (id: string | undefined) => void
  onDisableUser: (id: string) => void
  onEnableUser: (id: string) => void
}) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false)
  const id = row.id

  const { tienePermiso } = usePermisos()

  const puedeHabilitarUsuario = tienePermiso(PERMISOS.HABILITAR_USUARIOS)
  const puedeDeshabilitarUsuario = tienePermiso(PERMISOS.DESHABILITAR_USUARIOS)

  const puedeCambiarPass = tienePermiso(PERMISOS.CAMBIAR_CONTRASENA)

  const renderBotonEstadoUsuario = () => {
    if (!puedeHabilitarUsuario && !puedeDeshabilitarUsuario) {
      return null
    }

    if (puedeDeshabilitarUsuario && row.habilitado) {
      return (
        <DropdownMenuItem asChild>
          <button
            onClick={() => id && onDisableUser(id)}
            className="flex w-full cursor-pointer flex-row items-center justify-start text-redcremona"
          >
            <CircleMinus className="mr-2 h-4 w-4" />
            <span>Deshabilitar</span>
          </button>
        </DropdownMenuItem>
      )
    }

    if (puedeHabilitarUsuario && !row.habilitado) {
      return (
        <DropdownMenuItem asChild>
          <button
            onClick={() => id && onEnableUser(id)}
            className="flex w-full cursor-pointer flex-row items-center justify-start text-greencremona"
          >
            <CirclePlus className="mr-2 h-4 w-4" />
            <span>Habilitar</span>
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
            className="flex w-full cursor-pointer flex-row items-center justify-start text-orangecremona"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Cambiar contraseña</span>
          </button>
        </DropdownMenuItem>
      )
    }
  }

  return (
    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8">
            <span className="sr-only">Abrir menú</span>
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <button
              onClick={() => onEditUser(id)}
              className="flex w-full cursor-pointer flex-row items-center justify-start text-bluecremona"
            >
              <PencilLine className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </button>
          </DropdownMenuItem>
          {renderCambioPass()}
          {renderBotonEstadoUsuario()}
        </DropdownMenuContent>
      </DropdownMenu>
      {id ? (
        <EditarContraseña
          userId={id}
          onPasswordChanged={() => setIsPasswordDialogOpen(false)}
        />
      ) : null}
    </Dialog>
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
          <DropdownMenuItem
            onClick={() => onEditGrupo(row)}
            className="flex cursor-pointer flex-row items-center justify-start text-bluecremona"
          >
            <PencilLine className="h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex cursor-pointer flex-row items-center justify-start text-redcremona"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenuItem>
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
          <DropdownMenuItem
            onClick={() => onEditModulo(row)}
            className="flex cursor-pointer flex-row items-center justify-start text-bluecremona"
          >
            <PencilLine className="h-4 w-4" />
            <p className="items-center justify-start">Editar</p>
          </DropdownMenuItem>
          {row.habilitado ? (
            <DropdownMenuItem
              onClick={() => nombre && onDisableModulo(nombre)}
              className="flex-1 cursor-pointer flex-row items-center justify-start text-redcremona"
            >
              <CircleMinus className="h-4 w-4" />
              <p className="items-center justify-start">Deshabilitar</p>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => nombre && onEnableModulo(nombre)}
              className="cursor-pointer flex-row items-center justify-start text-greencremona"
            >
              <CirclePlus className="h-4 w-4" />
              <p className="items-center justify-start">Habilitar</p>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer flex-row items-center justify-start text-redcremona"
          >
            <Trash2 className="h-4 w-4" />
            <p className="items-center justify-start">Eliminar</p>
          </DropdownMenuItem>
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
          <DropdownMenuItem
            onClick={() => onEditSubmodulo(row)}
            className="flex cursor-pointer flex-row items-center justify-start text-bluecremona"
          >
            <PencilLine className="h-4 w-4" />
            <p className="items-center justify-start">Editar</p>
          </DropdownMenuItem>
          {row.habilitado ? (
            <DropdownMenuItem
              onClick={() => nombre && onDisableSubmodulo(nombre)}
              className="cursor-pointer flex-row items-center justify-start text-redcremona"
            >
              <CircleMinus className="h-4 w-4" />
              <p className="items-center justify-start">Deshabilitar</p>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => nombre && onEnableSubmodulo(nombre)}
              className="cursor-pointer flex-row items-center justify-start text-greencremona"
            >
              <CirclePlus className="h-4 w-4" />
              <p className="items-center justify-start">Habilitar</p>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer flex-row items-center justify-start text-redcremona"
          >
            <Trash2 className="h-4 w-4" />
            <p className="items-center justify-start">Eliminar</p>
          </DropdownMenuItem>
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
  onEnableUser: (id: string) => void
): DataTableColumn<UsersData>[] => [
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
  {
    id: "actions",
    cell: ({ row }) => (
      <UserActionsCell
        row={row}
        onEditUser={onEditUser}
        onDisableUser={onDisableUser}
        onEnableUser={onEnableUser}
      />
    ),
  },
]

export const getGrupoColumns = (
  onEditGrupo: (grupo: GruposData) => void,
  onDeleteGrupo: (nombre: string) => void
): DataTableColumn<GruposData>[] => [
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
  {
    id: "actions",
    cell: ({ row }) => (
      <GrupoActionsCell
        row={row}
        onEditGrupo={onEditGrupo}
        onDeleteGrupo={onDeleteGrupo}
      />
    ),
  },
]

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
          <DropdownMenuItem
            onClick={() => onEditPermiso(row)}
            className="flex cursor-pointer flex-row items-center justify-start text-bluecremona"
          >
            <PencilLine className="h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer flex-row items-center justify-start text-redcremona"
          >
            <Trash2 className="h-4 w-4" />
            <span>Eliminar</span>
          </DropdownMenuItem>
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
  onDeletePermiso: (nombre: string) => void
): DataTableColumn<PermisosData>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <PermisoActionsCell
        row={row}
        onEditPermiso={onEditPermiso}
        onDeletePermiso={onDeletePermiso}
      />
    ),
  },
]

export const getModuloColumns = (
  onEditModulo: (modulo: ModulosData) => void,
  onDisableModulo: (nombre: string) => void,
  onEnableModulo: (nombre: string) => void,
  onDeleteModulo: (nombre: string) => void
): DataTableColumn<ModulosData>[] => [
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
  {
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
  },
]

export const getSubmoduloColumns = (
  onEditSubmodulo: (submodulo: SubmodulosData) => void,
  onDisableSubmodulo: (nombre: string) => void,
  onEnableSubmodulo: (nombre: string) => void,
  onDeleteSubmodulo: (nombre: string) => void
): DataTableColumn<SubmodulosData>[] => [
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
  {
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
  },
]
