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
import { Separator } from "@/components/ui/separator"

import { Check, ChevronDown, PencilLine, Trash2, } from "lucide-react"

import { Virtuoso } from "react-virtuoso"

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
type ObjectArray = Record<string, string | number>[]

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

export const SelectorMultiple = React.memo(function SelectorMultiple({
  placeholder,
  data,
  keyId = "id",
  keyLabel = "nombre",
  values,
  onValuesChange,
  extraClass,
  disabled = false,
}: {
  placeholder: string
  data: ObjectArray
  keyId?: string
  keyLabel?: string
  extraClass?: string
  disabled?: boolean
  values: (string | number)[]
  onValuesChange: (values: string[]) => void
}) {
  if (data.length === 0) {
    return (
      <div
        className={`flex min-h-10 w-full items-center rounded border-2 border-background6 bg-background3 px-3 py-2 text-sm opacity-70 ${extraClass ?? ""}`}
      >
        Filtros no disponibles
      </div>
    )
  }

  const toggle = (id: string) => {
    const stringValues = values.map(String)
    onValuesChange(
      stringValues.includes(id)
        ? stringValues.filter((v) => v !== id)
        : [...stringValues, id]
    )
  }

  const label =
    values.length === 0
      ? placeholder
      : data
          .filter((o) => values.map(String).includes(String(o[keyId])))
          .map((o) => o[keyLabel])
          .join(", ")

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={`flex min-h-10 w-full items-center justify-between rounded border-2 border-background6 bg-background3 px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 ${extraClass ?? ""}`}
        >
          <span
            className={`truncate ${values.length === 0 ? "opacity-50" : ""}`}
          >
            {label}
          </span>
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-1"
        align="start"
      >
        {data.map((opcion) => {
          const id = String(opcion[keyId])
          const selected = values.map(String).includes(id)
          return (
            <div
              key={id}
              onClick={() => toggle(id)}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm hover:bg-foreground/10"
            >
              <div className="flex size-4 shrink-0 items-center justify-center rounded border border-foreground/30">
                {selected && <Check className="size-3" />}
              </div>
              <span>{opcion[keyLabel]}</span>
            </div>
          )
        })}
      </PopoverContent>
    </Popover>
  )
})

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

export const TextScrollArea = React.memo(function TextScrollArea({
  tags,
  subtitles,
  selectedIndex,
  extraClass,
  placeholder,
  placeholderExtraClass,
  extras,
  onTagClick,
}: {
  tags: string[]
  subtitles?: string[]
  selectedIndex?: number
  extraClass?: string
  placeholder?: string
  placeholderExtraClass?: string
  extras?: (tag: string, index: number) => React.ReactNode
  onTagClick?: (tag: string, index: number) => void
}) {
  return (
    <div className={`flex flex-col rounded ${extraClass || ""}`}>
      {placeholder && (
        <h4
          className={`mb-2 leading-none font-medium ${placeholderExtraClass || ""}`}
        >
          {placeholder}
        </h4>
      )}
      {tags.length === 0 ? (
        <div className="flex flex-1 items-center justify-center opacity-50">
          <p className="text-sm">No hay datos disponibles</p>
        </div>
      ) : (
        <Virtuoso
          style={{ flex: 1, minHeight: 0, height: "100%" }}
          totalCount={tags.length}
          components={{
            Footer: () => (
              <p className="py-4 text-center text-sm opacity-50">
                No hay más datos disponibles
              </p>
            ),
          }}
          itemContent={(index) => {
            const tag = tags[index]
            const subtitle = subtitles?.[index]
            const isSelected = selectedIndex === index
            return (
              <div key={tag} className="mr-4">
                <span
                  className={`flex flex-row items-center rounded px-2 hover:bg-foreground/10 ${isSelected ? "bg-foreground/10" : ""}`}
                >
                  <div
                    onClick={() => onTagClick?.(tag, index)}
                    className="flex flex-1 cursor-pointer py-2"
                  >
                    <div className="flex flex-col">
                      <span className={isSelected ? "font-semibold" : ""}>
                        {tag}
                      </span>
                      {subtitle && (
                        <span className="text-xs opacity-50">{subtitle}</span>
                      )}
                    </div>
                  </div>
                  <div>{extras?.(tag, index)}</div>
                </span>
                {index < tags.length - 1 && <Separator className="my-2" />}
              </div>
            )
          }}
        />
      )}
    </div>
  )
})

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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

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
