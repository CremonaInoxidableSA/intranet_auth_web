"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleMinus, Ellipsis, PencilLine, Trash2 } from "lucide-react"

export type ColumnDef<T> = {
  accessorKey?: keyof T
  header?: string
  id?: string
  className?: string
  cell?: (props: { row: T }) => ReactNode
}

export type User = {
  id?: number
  email: string
  apellidoNombre: string
  grupos?: string[]
  habilitado: number
  reporte: number
}

export const columns = (
  onEditUser: (id: number | undefined) => void,
  onDisableUser: (usuario_id: number) => void,
  onEnableUser: (usuario_id: number) => void,
  onDeleteUser: (usuario_id: number) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "email",
    header: "Email",
    className: "hidden xl:table-cell",
  },
  {
    accessorKey: "apellidoNombre",
    header: "Apellido y Nombre",
  },
  {
    accessorKey: "grupos",
    header: "Grupos",
    cell: ({ row }) => {
      const grupos = row.grupos
      if (Array.isArray(grupos) && grupos.length > 0) {
        const grupoMap: Record<string, string> = {
          superadmin: "Superadmin",
          admin: "Admin",
          user: "Usuario",
        }
        return grupos.map((grupo) => grupoMap[grupo] ?? grupo ?? "—").join(", ")
      }
      return "—"
    },
  },
  {
    accessorKey: "habilitado",
    header: "Habilitado",
    className: "hidden xl:table-cell",
    cell: ({ row }) => (row.habilitado === 1 ? "Sí" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEditUser(user.id)}>
              <PencilLine className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {user.habilitado === 1 ? (
              <DropdownMenuItem
                onClick={() => user.id !== undefined && onDisableUser(user.id)}
              >
                <CircleMinus className="mr-2 h-4 w-4" />
                Deshabilitar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => user.id !== undefined && onEnableUser(user.id)}
              >
                <CircleMinus className="mr-2 h-4 w-4" />
                Habilitar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => user.id !== undefined && onDeleteUser(user.id)}
              className="text-redcremona focus:text-redcremona"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
