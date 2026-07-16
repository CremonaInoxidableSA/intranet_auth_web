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

type BotonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  extraClass?: string
  placeholder?: string
}

export const Boton = React.forwardRef<HTMLButtonElement, BotonProps>(
  ({ extraClass, placeholder, children, type = "button", ...props }, ref) => (
    <Button ref={ref} type={type} className={extraClass} {...props}>
      {children ?? placeholder}
    </Button>
  )
)

Boton.displayName = "Boton"

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

//---------------------------------------TABS---------------------------------------//
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TabData = {
  id: number
  nombre: string
}

export function TabsComp({
  data,
  extraClass,
  value,
  onValueChange,
}: {
  data: TabData[]
  extraClass?: string
  value?: string
  onValueChange?: (value: string) => void
}) {
  return (
    <Tabs
      value={value}
      defaultValue={String(data[0]?.id)}
      onValueChange={onValueChange}
    >
      <TabsList
        className="flex flex-wrap gap-2 overflow-visible px-1"
        variant="line"
      >
        {data.map((item) => (
          <TabsTrigger
            className={`min-w-max rounded-full px-4 py-2 text-sm whitespace-nowrap xl:px-5 xl:py-3 ${extraClass ?? ""}`}
            key={item.id}
            value={String(item.id)}
          >
            {item.nombre}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
