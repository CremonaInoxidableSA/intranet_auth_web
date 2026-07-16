"use client"

import { Button } from "@/components/ui/button"
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FormSubmodulo() {
  return (
    <DialogContent className="z-800 bg-background2 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>Crear Submódulo</DialogTitle>
        <DialogDescription>
          Complete los datos para crear un nuevo submódulo.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="modulo">Módulo</Label>
          <Input
            id="modulo"
            placeholder="Cree un módulo con nombre único"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="submodulos">Sub-módulos</Label>
          <Input
            id="submodulos"
            placeholder="Ingrese los sub-módulos del módulo separados por comas"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            placeholder="Ingrese la URL del módulo"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="icono">Icono</Label>
          <Input
            id="icono"
            placeholder="Ingrese el icono del módulo"
            required
            className="border border-background6 bg-background3"
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button>Crear Submódulo</Button>
      </DialogFooter>
    </DialogContent>
  )
}
