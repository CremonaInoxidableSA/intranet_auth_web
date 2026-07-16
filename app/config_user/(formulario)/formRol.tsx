"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function FormRol() {
  const [form, setForm] = useState({
    rol: "",
    accesos: [] as string[],
  })

  const handleChange = (
    key: string,
    value: string | boolean | number | string[]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const accesosText =
    form.accesos.length > 0
      ? form.accesos.join(", ")
      : "Seleccione los accesos que tendrá este rol"
  const accesosTextClass =
    form.accesos.length > 0 ? "text-foreground" : "text-muted-foreground"

  return (
    <DialogContent className="z-800 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>Crear Rol</DialogTitle>
        <DialogDescription>
          Complete los datos para crear un nuevo rol.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="rol">Nombre del Rol</Label>
          <Input
            id="rol"
            value={form.rol}
            onChange={(e) => handleChange("rol", e.target.value)}
            placeholder="Asigne un nombre único para este rol"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <Label>Accesos</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between border border-input bg-input/20 px-2 py-0.5 text-left hover:border-ring hover:bg-input/30",
                  accesosTextClass
                )}
              >
                <span className={accesosTextClass}>{accesosText}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={4} className="z-900 w-full">
              <DropdownMenuLabel>Modulos</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={form.accesos.includes("RRHH")}
                onSelect={(event) => event.preventDefault()}
              >
                RRHH
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={form.accesos.includes("Produccion")}
                onSelect={(event) => event.preventDefault()}
              >
                Produccion
              </DropdownMenuCheckboxItem>
              <DropdownMenuLabel>Sub-Modulos</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={form.accesos.includes("Ordenes_Produccion")}
                onSelect={(event) => event.preventDefault()}
              >
                Ordenes Produccion
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={form.accesos.includes("Personal")}
                onSelect={(event) => event.preventDefault()}
              >
                Personal
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button>Crear Rol</Button>
      </DialogFooter>
    </DialogContent>
  )
}
