"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleMinus, CirclePlus, Ellipsis, PencilLine } from "lucide-react"
import {
  UsersData,
  GruposData,
  ModulosData,
  SubmodulosData,
} from "@/types/types"
import { type DataTableColumn } from "./data-table"

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
    cell: ({ row }) => {
      const id = row.extra?.id

      return (
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
              onClick={() => onEditUser(id)}
              className="flex cursor-pointer flex-row items-center justify-start text-bluecremona"
            >
              <PencilLine className="h-4 w-4" />
              <p className="items-center justify-start">Editar</p>
            </DropdownMenuItem>
            {row.extra?.habilitado ? (
              <DropdownMenuItem
                onClick={() => id && onDisableUser(id)}
                className="cursor-pointer flex-row items-center justify-start text-redcremona"
              >
                <CircleMinus className="h-4 w-4" />
                <p className="items-center justify-start">Deshabilitar</p>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => id && onEnableUser(id)}
                className="cursor-pointer flex-row items-center justify-start text-greencremona"
              >
                <CirclePlus className="h-4 w-4" />
                <p className="items-center justify-start">Habilitar</p>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export const getGrupoColumns = (
  onEditGrupo: (grupo: GruposData) => void
): DataTableColumn<GruposData>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    className: "font-medium",
  },
  {
    header: "Permisos",
    cell: () => (
      <p className="items-center justify-start">Editar para ver permisos</p>
    ),
  },
  {
    header: "Modulos",
    cell: () => (
      <p className="items-center justify-start">Editar para ver modulos</p>
    ),
  },
  {
    header: "Submodulos",
    cell: () => (
      <p className="items-center justify-start">Editar para ver submodulos</p>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="h-8 w-8"
        onClick={() => onEditGrupo(row)}
      >
        <span className="sr-only">Editar</span>
        <PencilLine className="h-4 w-4" />
      </Button>
    ),
  },
]

export const getModuloColumns = (
  onEditModulo: (modulo: ModulosData) => void
): DataTableColumn<ModulosData>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    className: "font-medium",
  },
  {
    header: "URL",
    cell: ({ row }) => (
      <p className="items-center justify-start">
        {row.subdominio ? `${row.subdominio}` : "—"}
      </p>
    ),
  },
  {
    header: "Submodulos",
    cell: () => (
      <p className="items-center justify-start">Editar para ver submodulos</p>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="h-8 w-8"
        onClick={() => onEditModulo(row)}
      >
        <span className="sr-only">Editar</span>
        <PencilLine className="h-4 w-4" />
      </Button>
    ),
  },
]

export const getSubmoduloColumns = (
  onEditSubmodulo: (submodulo: SubmodulosData) => void
): DataTableColumn<SubmodulosData>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    className: "font-medium",
  },
  {
    header: "URL",
    cell: ({ row }) => (
      <p className="items-center justify-start">
        {row.path ? `${row.path}` : "—"}
      </p>
    ),
  },
  {
    header: "Modulo Principal",
    cell: ({ row }) => (
      <p className="items-center justify-start">
        {row.modulo_padre ? `${row.modulo_padre}` : "—"}
      </p>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="h-8 w-8"
        onClick={() => onEditSubmodulo(row)}
      >
        <span className="sr-only">Editar</span>
        <PencilLine className="h-4 w-4" />
      </Button>
    ),
  },
]
