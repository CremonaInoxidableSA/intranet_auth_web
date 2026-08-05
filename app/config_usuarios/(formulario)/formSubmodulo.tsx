"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import { HoverInfo } from "@/components/components"
import { fetchModulos, type Modulo } from "../(data)/modulos"
import { SubmodulosData } from "@/types/types"
import { Checkbox } from "@/components/ui/checkbox";

const hoverInfoText = {
  nombre: 'El submódulo debe tener el formato "SUBMODULO_{nombre}"',
  path: "Parte final de la URL: {subdominio}.[intranetcreminox.com/{path}]. Especificar sin / inicial. En caso de ser {path_principal}/{path_secundario} especificar entero.",
  icono:
    "Nombre del icono que utilizará el submódulo. Debe buscarse en la librería de lucide-react o react-icons.",
}

type Props = {
  onSubmoduloCreated?: () => void
  isEditing?: boolean
  initialData?: SubmodulosData
}

const initialForm: SubmodulosData = {
  modulo_padre: "",
  nombre: "",
  path: "",
  icono: "",
  habilitado: true,
}

export default function FormSubmodulo({
  onSubmoduloCreated,
  isEditing = false,
  initialData,
}: Props) {
  const [form, setForm] = useState<SubmodulosData>(initialForm)
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [isLoadingModulos, setIsLoadingModulos] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModuloSelectorOpen, setIsModuloSelectorOpen] = useState(false)
  const [moduloPadreDraft, setModuloPadreDraft] = useState("")
  const [identifier, setIdentifier] = useState("")

  useEffect(() => {
    let isMounted = true

    const loadModulos = async () => {
      setIsLoadingModulos(true)

      try {
        const response = await fetchModulos(
          { numeroPagina: 1, filtro: "0" },
          { Accept: "application/json" }
        )
        if (isMounted) {
          setModulos(response.data)
        }
      } catch {
        if (isMounted) {
          setModulos([])
        }
      } finally {
        if (isMounted) {
          setIsLoadingModulos(false)
        }
      }
    }

    loadModulos()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setForm({
      modulo_padre: initialData?.modulo_padre ?? "",
      nombre: initialData?.nombre ?? "",
      path: initialData?.path ?? "",
      icono: initialData?.icono ?? "",
      habilitado: initialData?.habilitado ?? true,
    })
    setIdentifier(initialData?.nombre ?? "")
  }, [initialData])

  const handleChange = (field: keyof SubmodulosData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const openModuloSelector = () => {
    setModuloPadreDraft(form?.modulo_padre ?? "")
    setIsModuloSelectorOpen(true)
  }

  const confirmModuloSelection = () => {
    handleChange("modulo_padre", moduloPadreDraft)
    setIsModuloSelectorOpen(false)
  }

  const handleSubmit = async () => {
    if (
      !form?.modulo_padre?.trim() ||
      !form?.nombre?.trim() ||
      !form?.path?.trim() ||
      !form?.icono?.trim() ||
      form.habilitado === undefined
    ) {
      toast.error("Complete todos los campos")
      return
    }

    const nombreTrim = form.nombre.trim()
    if (!/^SUBMODULO_[A-Za-z0-9_]+$/.test(nombreTrim)) {
      toast.error('El nombre debe tener el formato "SUBMODULO_{nombre}"')
      return
    }

    const recordIdentifier = isEditing
      ? identifier || initialData?.nombre || nombreTrim
      : undefined

    const resolvedIdentifier = recordIdentifier?.trim() || ""

    if (isEditing && !resolvedIdentifier) {
      toast.error("No se pudo identificar el submódulo a editar")
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = isEditing
        ? `/api/permisos/submodulos/editar?submodulo_nombre=${encodeURIComponent(resolvedIdentifier)}`
        : "/api/permisos/submodulos/crear"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetchWithKeycloak(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing
            ? {
                modulo_padre: form.modulo_padre.trim(),
                path: form.path.trim(),
                icono: form.icono.trim(),
              }
            : {
                modulo_padre: form.modulo_padre.trim(),
                nombre: nombreTrim,
                path: form.path.trim(),
                icono: form.icono.trim(),
                habilitado: form.habilitado,
              }
        ),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error || data?.detail || "Error al guardar submódulo")
        return
      }

      toast.success(
        isEditing
          ? "Submódulo actualizado correctamente"
          : "Submódulo creado correctamente"
      )
      if (!isEditing) {
        setForm(initialForm)
      }
      onSubmoduloCreated?.()
    } catch {
      toast.error("Error de conexión con la API")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="z-100 bg-background2 sm:max-w-180">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Submódulo" : "Crear Submódulo"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Actualice los datos del submódulo y guarde los cambios."
            : "Complete los datos para crear un nuevo submódulo."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="modulo-padre">Módulo padre</Label>
            <HoverInfo
              placeholder="i"
              content={
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Módulo padre</p>
                  <p>
                    Seleccione uno solo de la tabla para asignarlo al submódulo.
                  </p>
                </div>
              }
              extraClass="h-4 px-0 text-xs text-muted-foreground"
            />
          </div>

          <Dialog
            open={isModuloSelectorOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsModuloSelectorOpen(false)
                return
              }
              openModuloSelector()
            }}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-fit border border-background6 bg-background3 text-sm"
                onClick={openModuloSelector}
              >
                {form.modulo_padre
                  ? `✓ ${form.modulo_padre}`
                  : "+ Seleccionar módulo padre"}
              </Button>
            </DialogTrigger>
            <DialogContent className="z-100 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Seleccionar módulo padre</DialogTitle>
                <DialogDescription>
                  Elija un único módulo para asignarlo como padre del submódulo.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-72 overflow-auto rounded border border-background6 bg-background3">
                {isLoadingModulos ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    Cargando módulos...
                  </div>
                ) : modulos.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    No hay módulos disponibles para seleccionar.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">Sel.</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Path</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modulos.map((modulo) => {
                        const isSelected = moduloPadreDraft === modulo.nombre
                        return (
                          <TableRow key={modulo.nombre}>
                            <TableCell>
                              <input
                                id={`modulo-${modulo.nombre}`}
                                type="radio"
                                name="modulo_padre_selector"
                                checked={isSelected}
                                onChange={() =>
                                  setModuloPadreDraft(modulo.nombre ?? "")
                                }
                                className="h-4 w-4"
                              />
                            </TableCell>
                            <TableCell>{modulo.nombre}</TableCell>
                            <TableCell>{modulo.path}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={confirmModuloSelection}>Seleccionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="nombre">Nombre del submódulo</Label>
            <HoverInfo
              placeholder="i"
              content={
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Nombre Submodulo</p>
                  <p>{hoverInfoText.nombre}</p>
                </div>
              }
              extraClass="h-4 px-0 text-xs text-muted-foreground"
            />
          </div>
          <Input
            id="nombre"
            value={form.nombre}
            disabled={isEditing}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Ej: SUBMODULO_USUARIOS"
            required
            className={`border border-background6 bg-background3 ${isEditing ? "cursor-not-allowed" : ""}`}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="path">Path</Label>
            <HoverInfo
              placeholder="i"
              content={
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Path</p>
                  <p>{hoverInfoText.path}</p>
                </div>
              }
              extraClass="h-4 px-0 text-xs text-muted-foreground"
            />
          </div>
          <Input
            id="path"
            value={form.path}
            onChange={(e) => handleChange("path", e.target.value)}
            placeholder="Ej: usuarios/lista"
            required
            className="border border-background6 bg-background3"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="icono">Nombre del icono</Label>
            <HoverInfo
              placeholder="i"
              content={
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Nombre del icono</p>
                  <p>{hoverInfoText.icono}</p>
                </div>
              }
              extraClass="h-4 px-0 text-xs text-muted-foreground"
            />
          </div>
          <Input
            id="icono"
            value={form.icono}
            onChange={(e) => handleChange("icono", e.target.value)}
            placeholder="Ej: UserRound"
            required
            className="border border-background6 bg-background3"
          />
        </div>
      </div>

      {!isEditing && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="submoduloHabilitado"
            checked={form.habilitado}
            onCheckedChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                habilitado: !!checked,
              }))
            }
          />
          <Label htmlFor="submoduloHabilitado" className="cursor-pointer">
            El submódulo se creará habilitado y podrá ser accedido. Desmarque esta
            opción para crear un submódulo deshabilitado.
          </Label>
        </div>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit} loading={isSubmitting}>
          {isEditing ? "Guardar cambios" : "Crear Submódulo"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
