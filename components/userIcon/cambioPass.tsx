"use client"

import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import keycloak from "@/lib/keycloak/keycloak"

type CambioPassProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CambioPass = ({ open, onOpenChange }: CambioPassProps) => {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (
    key: "current_password" | "new_password",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleClose = () => {
    if (loading) return

    setForm({
      current_password: "",
      new_password: "",
    })

    onOpenChange(false)
  }

  const handleSubmit = async () => {
    if (!form.new_password) {
      toast.error("Ingrese la nueva contraseña")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/changePersonalPassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({
          password: form.new_password,
          password_confirmation: form.new_password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data?.error ?? "Error al cambiar la contraseña")
        return
      }

      toast.success("Contraseña actualizada correctamente")
      handleClose()
    } catch (error) {
      console.error("Error al cambiar contraseña:", error)
      toast.error("Error de comunicación con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="z-800 bg-background3 sm:max-w-150">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <DialogDescription>
            Complete los datos para cambiar la contraseña.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current_password">Contraseña Actual</Label>

            <Input
              id="current_password"
              type="password"
              value={form.current_password}
              onChange={(e) => handleChange("current_password", e.target.value)}
              placeholder="Ingrese su contraseña actual"
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new_password">Nueva Contraseña</Label>

            <Input
              id="new_password"
              type="password"
              value={form.new_password}
              onChange={(e) => handleChange("new_password", e.target.value)}
              placeholder="Ingrese su nueva contraseña"
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <span>Cambiando...</span>
              </div>
            ) : (
              "Cambiar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CambioPass
