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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Textarea } from "@/components/ui/textarea"

import { useState } from "react"
import { useAuth } from "@/context/AuthProvider"
import { toast } from "sonner"
import { fetchWithKeycloak } from "@/lib/keycloak-fetch"

export default function GenerarReclamo() {
  const { email } = useAuth()

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    area: "",
    reporte: "",
  })

  const handleChange = (key: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!form.nombre || !form.apellido || !form.area || !form.reporte) {
      toast.error("Complete todos los campos", {
        position: "top-center",
      })
      return
    }

    if (!email) {
      toast.error("Error: correo electrónico no disponible", {
        position: "top-center",
      })
      return
    }

    try {
      const response = await fetchWithKeycloak(
        `/api/proxy/mail/reclamos/crear`,
        {
          method: "POST",
          body: JSON.stringify({
            nombre: form.nombre,
            apellido: form.apellido,
            area: form.area,
            reporte: form.reporte,
            email: email,
          }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.enviado) {
          toast.success("Reclamo enviado correctamente", {
            position: "top-center",
          })
          setForm({ nombre: "", apellido: "", area: "", reporte: "" })
        } else {
          toast.error("Error al enviar el reclamo", {
            position: "top-center",
          })
        }
      } else {
        toast.error("Error al enviar el reclamo", {
          position: "top-center",
        })
      }
    } catch (error) {
      toast.error(`Error al enviar el reclamo: ${error}`, {
        position: "top-center",
      })
    }
  }

  return (
    <DialogContent className="z-800 bg-background3 sm:max-w-150">
      <DialogHeader>
        <DialogTitle>Generar Reclamo</DialogTitle>
        <DialogDescription>
          Complete los datos para generar un nuevo reclamo.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={form.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Ingrese el nombre del usuario"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="surname">Apellido</Label>
          <Input
            id="surname"
            value={form.apellido}
            onChange={(e) => handleChange("apellido", e.target.value)}
            placeholder="Ingrese el apellido del usuario"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>¿Dónde se encuentra el problema?</Label>
          <Select
            value={form.area}
            onValueChange={(v) => handleChange("area", v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccione un área" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-900">
              <SelectGroup>
                <SelectLabel>Área</SelectLabel>
                <SelectItem value="exportacion">Exportación</SelectItem>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="reportes">Reportes</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Detalle del Reclamo</Label>
        <Textarea
          className="w-full"
          placeholder="Ingrese el detalle del reclamo"
          rows={5}
          value={form.reporte}
          onChange={(e) => handleChange("reporte", e.target.value)}
        ></Textarea>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>Generar Reclamo</Button>
      </DialogFooter>
    </DialogContent>
  )
}
