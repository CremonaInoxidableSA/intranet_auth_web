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
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
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
} from "@/types/types"
import { type DataTableColumn } from "./data-table"
import { EditarContraseña } from "../(formulario)/formUsuario"

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
  const id = row.extra?.id

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
              type="button"
              onClick={() => onEditUser(id)}
              className="flex w-full cursor-pointer flex-row items-center justify-start text-bluecremona"
            >
              <PencilLine className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-left" asChild>
            <button
              type="button"
              onClick={() => setIsPasswordDialogOpen(true)}
              className="flex w-full cursor-pointer flex-row items-center justify-start text-orangecremona"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Cambiar contraseña</span>
            </button>
          </DropdownMenuItem>
          {row.extra?.habilitado ? (
            <DropdownMenuItem asChild>
              <button
                type="button"
                onClick={() => id && onDisableUser(id)}
                className="flex w-full cursor-pointer flex-row items-center justify-start text-redcremona"
              >
                <CircleMinus className="mr-2 h-4 w-4" />
                <span>Deshabilitar</span>
              </button>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <button
                type="button"
                onClick={() => id && onEnableUser(id)}
                className="flex w-full cursor-pointer flex-row items-center justify-start text-greencremona"
              >
                <CirclePlus className="mr-2 h-4 w-4" />
                <span>Habilitar</span>
              </button>
            </DropdownMenuItem>
          )}
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
    cell: ({ row }) => row.extra?.apellidoNombre || "—",
  },
  {
    accessorKey: "grupos",
    header: "Grupos",
    className: "hidden xl:table-cell",
    cell: ({ row }) =>
      row.grupos?.length ? row.grupos.map((grupo) => grupo).join(", ") : "—",
  },
  {
    header: "Habilitado",
    className: "hidden xl:table-cell",
    cell: ({ row }) => (row.extra?.habilitado ? "Sí" : "No"),
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
