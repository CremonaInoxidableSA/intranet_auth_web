"use client";

import type { ReactNode } from "react";
import {
  IoEllipsisHorizontal,
  IoPencilOutline,
  IoTrashOutline,
  IoRemoveCircleOutline,
} from "react-icons/io5";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ColumnDef<T> = {
  accessorKey?: keyof T;
  header?: string;
  id?: string;
  cell?: (props: { row: T }) => ReactNode;
};

export type User = {
  id?: number;
  email: string;
  username: string;
  nombre: string;
  apellido: string;
  rol: string;
  habilitado: number;
  reporte: number;
};

export const columns = (
  onEditUser: (id: number | undefined, username: string) => void,
  onDisableUser: (username: string) => void,
  onEnableUser: (username: string) => void,
  onDeleteUser: (username: string) => void,
): ColumnDef<User>[] => [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "username",
    header: "Usuario",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "apellido",
    header: "Apellido",
  },
  {
    accessorKey: "rol",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.rol;
      const roleMap: Record<string, string> = {
        superadmin: "Superadmin",
        admin: "Admin",
        user: "Usuario",
      };
      return roleMap[role] ?? role ?? "—";
    },
  },
  {
    accessorKey: "habilitado",
    header: "Habilitado",
    cell: ({ row }) => (row.habilitado === 1 ? "Sí" : "No"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <IoEllipsisHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onEditUser(user.id, user.username)}
            >
              <IoPencilOutline className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {user.habilitado === 1 ? (
              <DropdownMenuItem onClick={() => onDisableUser(user.username)}>
                <IoRemoveCircleOutline className="mr-2 h-4 w-4" />
                Deshabilitar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onEnableUser(user.username)}>
                <IoRemoveCircleOutline className="mr-2 h-4 w-4" />
                Habilitar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDeleteUser(user.username)}
              className="text-redcremona focus:text-redcremona"
            >
              <IoTrashOutline className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
