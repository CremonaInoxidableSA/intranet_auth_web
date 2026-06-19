import * as React from "react"
import { ComponentProps } from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PencilLine, Trash2 } from "lucide-react"

//---------------------------------------BOTONES---------------------------------------//
export function EliminarButton({
  extraClass,
  onClick,
}: {
  extraClass?: string
  onClick?: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer">
      <Trash2 className={`aspect-square text-redcremona ${extraClass}`} />
    </button>
  )
}

export function EditarButton({
  extraClass,
  onClick,
}: {
  extraClass?: string
  onClick?: () => void
}) {
  return (
    <PencilLine
      className={`aspect-square h-full cursor-pointer items-center justify-center text-bluecremona ${extraClass}`}
      onClick={onClick}
    />
  )
}

export function Boton({
  extraClass,
  placeholder,
  children,
  type = "button",
  disabled,
}: {
  extraClass?: string
  placeholder?: string
  children?: React.ReactNode
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}) {
  return (
    <Button type={type} disabled={disabled} className={extraClass}>
      {children ?? placeholder}
    </Button>
  )
}

//---------------------------------------SELECTORES---------------------------------------//
export function Selector({ placeholder }: { placeholder: string }) {
  return (
    <Select>
      <SelectTrigger className="min-h-10 w-full rounded border-2 border-background6 bg-background3 px-3 py-2 text-sm focus:border-background6">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectItem value="opcion1">1192</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

//---------------------------------------TABLAS---------------------------------------//
export function Tabla({
  columns,
  data,
}: {
  columns: string[]
  data: Record<string, string>[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background3">
          {columns.map((column, index) => (
            <TableHead key={index}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => (
              <TableCell key={colIndex}>{row[column]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

//---------------------------------------INPUTS---------------------------------------//
type InputsProps = ComponentProps<typeof Input> & {
  extraClassName?: string
}

export function Inputs({ extraClassName, className, ...props }: InputsProps) {
  return (
    <Input
      {...props}
      className={`min-h-10 w-full rounded border-2 border-background6 bg-background3 px-3 py-2 text-sm focus:border-background6 ${
        extraClassName ?? ""
      } ${className ?? ""}`}
    />
  )
}