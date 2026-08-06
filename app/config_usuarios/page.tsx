"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Boton, TabsComp } from "@/components/components"
import FormGrupo from "./(formulario)/formGrupo"
import FormPermiso from "./(formulario)/formPermiso"
import FormModulo from "./(formulario)/formModulo"
import FormSubmodulo from "./(formulario)/formSubmodulo"
import { EditarUsuario } from "./(formulario)/formUsuario"
import { DataTable, type DataTableColumn } from "./(table)/data-table"
import type { GruposData, ModulosData, SubmodulosData } from "@/types/types"
import { AlertaToaster } from "@/components/components"
import { useAuth } from "@/context/AuthProvider"
import { useAutorizacion } from "@/context/useAutorizacion"
import { AUTORIZACIONES } from "@/lib/permisos"
import {
  useConfiguracionUsuario,
  TAB_USUARIOS,
  TAB_GRUPOS,
  TAB_PERMISOS,
  TAB_MODULOS,
  TAB_SUBMODULOS,
} from "./funciones"

export default function ConfiguracionUsuario() {
  const router = useRouter()
  const { loading } = useAuth()
  const { tieneAccesoSubmodulo } = useAutorizacion()

  const canAccessConfigUsuarios = tieneAccesoSubmodulo(
    AUTORIZACIONES.CONFIG_USUARIOS
  )

  useEffect(() => {
    if (loading) {
      return
    }

    if (!canAccessConfigUsuarios) {
      toast.error("No tiene acceso a Configuracion de usuarios.", {
        id: "config-usuarios-sin-acceso",
      })
      router.replace("/")
    }
  }, [canAccessConfigUsuarios, loading, router])

  const {
    selectedTabId,
    setSelectedTabId,
    tablas,
    data,
    isLoading,
    userIdToEdit,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editTarget,
    setEditTarget,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    userPage,
    setUserPage,
    userFilterInput,
    setUserFilterInput,
    userTotalPages,
    userTotalRecords,
    groupPage,
    setGroupPage,
    groupFilterInput,
    setGroupFilterInput,
    groupTotalPages,
    groupTotalRecords,
    permPage,
    setPermPage,
    permFilterInput,
    setPermFilterInput,
    permTotalPages,
    permTotalRecords,
    modPage,
    setModPage,
    modFilterInput,
    setModFilterInput,
    modTotalPages,
    modTotalRecords,
    subPage,
    setSubPage,
    subFilterInput,
    setSubFilterInput,
    subTotalPages,
    subTotalRecords,
    user,
    deshabilitarUsuario,
    habilitarUsuario,
    handleUserCreated,
    handleUserUpdated,
    aplicarFiltroUsuarios,
    limpiarFiltroUsuarios,
    aplicarFiltroGrupos,
    limpiarFiltroGrupos,
    aplicarFiltroPermisos,
    limpiarFiltroPermisos,
    aplicarFiltroModulos,
    limpiarFiltroModulos,
    aplicarFiltroSubmodulos,
    limpiarFiltroSubmodulos,
    handleGrupoCreated,
    handleModuloCreated,
    handlePermisoCreated,
    handleGrupoUpdated,
    handlePermisoUpdated,
    handleModuloUpdated,
    handleSubmoduloCreated,
    handleSubmoduloUpdated,
    currentColumns,
    currentCreateButton,
  } = useConfiguracionUsuario()

  if (!loading && !canAccessConfigUsuarios) {
    return null
  }

  const renderCreateForm = () => {
    switch (selectedTabId) {
      case TAB_USUARIOS:
        return <EditarUsuario onUserCreated={handleUserCreated} />
      case TAB_GRUPOS:
        return <FormGrupo onGrupoCreated={handleGrupoCreated} />
      case TAB_MODULOS:
        return <FormModulo onModuloCreated={handleModuloCreated} />
      case TAB_SUBMODULOS:
        return <FormSubmodulo onSubmoduloCreated={handleSubmoduloCreated} />
      case TAB_PERMISOS:
        return <FormPermiso onPermisoCreated={handlePermisoCreated} />
      default:
        return null
    }
  }

  const renderEditForm = () => {
    if (editTarget?.tabId === TAB_GRUPOS) {
      return (
        <FormGrupo
          isEditing
          initialData={editTarget.item as GruposData | undefined}
          onGrupoCreated={handleGrupoUpdated}
        />
      )
    }

    if (editTarget?.tabId === TAB_MODULOS) {
      return (
        <FormModulo
          isEditing
          initialData={editTarget.item as ModulosData | undefined}
          onModuloCreated={handleModuloUpdated}
        />
      )
    }

    if (editTarget?.tabId === TAB_SUBMODULOS) {
      return (
        <FormSubmodulo
          isEditing
          initialData={editTarget.item as SubmodulosData | undefined}
          onSubmoduloCreated={handleSubmoduloUpdated}
        />
      )
    }

    if (editTarget?.tabId === TAB_PERMISOS) {
      return (
        <FormPermiso
          isEditing
          initialData={editTarget.item as any}
          onPermisoCreated={handlePermisoUpdated}
        />
      )
    }

    if (userIdToEdit !== undefined && user?.id !== undefined) {
      return (
        <EditarUsuario
          onUserCreated={handleUserUpdated}
          userIdToEdit={userIdToEdit}
          onDisableUser={deshabilitarUsuario}
          onEnableUser={habilitarUsuario}
        />
      )
    }

    return null
  }

  return (
    <section className="flex flex-1 flex-col gap-5 p-5">
      <div className="flex w-full flex-1 flex-col gap-5">
        <div className="flex w-full flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col gap-3 xl:w-auto">
            {tablas.length > 0 ? (
              <>
                <div className="hidden xl:block">
                  <TabsComp
                    data={tablas}
                    extraClass="xl:text-xl"
                    value={String(selectedTabId)}
                    onValueChange={(value) => setSelectedTabId(Number(value))}
                  />
                </div>
                <div className="block xl:hidden">
                  <label htmlFor="mobile-tab-select" className="sr-only">
                    Seleccionar lista
                  </label>
                  <select
                    id="mobile-tab-select"
                    value={String(selectedTabId)}
                    onChange={(event) =>
                      setSelectedTabId(Number(event.target.value))
                    }
                    className="w-full rounded border border-background6 bg-background3 px-3 py-2 text-sm text-foreground transition outline-none focus:border-background5"
                  >
                    {tablas.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <AlertaToaster
                  message="No tiene permisos para visualizar modulos de configuracion."
                  toastId="config-usuarios-sin-permisos"
                />
                <p className="text-sm text-muted-foreground">
                  No tiene permisos para visualizar modulos de configuracion.
                </p>
              </>
            )}
          </div>

          {currentCreateButton ? (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Boton
                  extraClass={`${currentCreateButton.extraClass} w-full xl:w-auto`}
                >
                  {currentCreateButton.nombre}
                </Boton>
              </DialogTrigger>
              {renderCreateForm()}
            </Dialog>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-5">
          {selectedTabId === TAB_USUARIOS && (
            <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col gap-2 xl:max-w-xl xl:flex-row">
                <Input
                  id="user-filter-input"
                  value={userFilterInput}
                  onChange={(event) => setUserFilterInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") aplicarFiltroUsuarios()
                  }}
                  placeholder="Filtrar por nombre, apellido o email"
                  className="border border-background6 bg-background3"
                />
                <div className="flex w-full gap-2">
                  <Button
                    onClick={aplicarFiltroUsuarios}
                    className="flex-1 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
                  >
                    Filtrar
                  </Button>
                  <Button
                    onClick={limpiarFiltroUsuarios}
                    className="flex-1 border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          )}
          {selectedTabId === TAB_GRUPOS && (
            <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col gap-2 xl:max-w-xl xl:flex-row">
                <Input
                  id="group-filter-input"
                  value={groupFilterInput}
                  onChange={(event) => setGroupFilterInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") aplicarFiltroGrupos()
                  }}
                  placeholder="Filtrar por nombre"
                  className="border border-background6 bg-background3"
                />
                <div className="flex w-full gap-2">
                  <Button
                    onClick={aplicarFiltroGrupos}
                    className="flex-1 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
                  >
                    Filtrar
                  </Button>
                  <Button
                    onClick={limpiarFiltroGrupos}
                    className="flex-1 border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          )}
          {selectedTabId === TAB_PERMISOS && (
            <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col gap-2 xl:max-w-xl xl:flex-row">
                <Input
                  id="perm-filter-input"
                  value={permFilterInput}
                  onChange={(event) => setPermFilterInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") aplicarFiltroPermisos()
                  }}
                  placeholder="Filtrar por nombre de permiso"
                  className="border border-background6 bg-background3"
                />
                <div className="flex w-full gap-2">
                  <Button
                    onClick={aplicarFiltroPermisos}
                    className="flex-1 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
                  >
                    Filtrar
                  </Button>
                  <Button
                    onClick={limpiarFiltroPermisos}
                    className="flex-1 border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          )}
          {selectedTabId === TAB_MODULOS && (
            <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col gap-2 xl:max-w-xl xl:flex-row">
                <Input
                  id="mod-filter-input"
                  value={modFilterInput}
                  onChange={(event) => setModFilterInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") aplicarFiltroModulos()
                  }}
                  placeholder="Filtrar por nombre"
                  className="border border-background6 bg-background3"
                />
                <div className="flex w-full gap-2">
                  <Button
                    onClick={aplicarFiltroModulos}
                    className="flex-1 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
                  >
                    Filtrar
                  </Button>
                  <Button
                    onClick={limpiarFiltroModulos}
                    className="flex-1 border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          )}
          {selectedTabId === TAB_SUBMODULOS && (
            <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex w-full flex-col gap-2 xl:max-w-xl xl:flex-row">
                <Input
                  id="sub-filter-input"
                  value={subFilterInput}
                  onChange={(event) => setSubFilterInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") aplicarFiltroSubmodulos()
                  }}
                  placeholder="Filtrar por nombre"
                  className="border border-background6 bg-background3"
                />
                <div className="flex w-full gap-2">
                  <Button
                    onClick={aplicarFiltroSubmodulos}
                    className="flex-1 border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
                  >
                    Filtrar
                  </Button>
                  <Button
                    onClick={limpiarFiltroSubmodulos}
                    className="flex-1 border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DataTable
            key={selectedTabId}
            columns={
              currentColumns as DataTableColumn<Record<string, unknown>>[]
            }
            extraClass="w-full"
            data={data as Record<string, unknown>[]}
            disableClientPagination={
              selectedTabId === TAB_USUARIOS ||
              selectedTabId === TAB_GRUPOS ||
              selectedTabId === TAB_MODULOS ||
              selectedTabId === TAB_SUBMODULOS
            }
            isLoading={isLoading}
            emptyMessage="No hay registros disponibles"
            loadingMessage="Cargando datos..."
            showPageInfo={
              selectedTabId === TAB_USUARIOS ||
              selectedTabId === TAB_GRUPOS ||
              selectedTabId === TAB_MODULOS ||
              selectedTabId === TAB_SUBMODULOS
            }
          />
          {selectedTabId === TAB_USUARIOS && (
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Total usuarios: {userTotalRecords}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-28 text-center text-sm">
                  Página {userPage} de {Math.max(userTotalPages, 1)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={userPage >= Math.max(userTotalPages, 1)}
                  onClick={() =>
                    setUserPage((prev) =>
                      Math.min(prev + 1, Math.max(userTotalPages, 1))
                    )
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
          {selectedTabId === TAB_GRUPOS && (
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Total grupos: {groupTotalRecords}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={groupPage <= 1}
                  onClick={() => setGroupPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-28 text-center text-sm">
                  Página {groupPage} de {Math.max(groupTotalPages, 1)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={groupPage >= Math.max(groupTotalPages, 1)}
                  onClick={() =>
                    setGroupPage((prev) =>
                      Math.min(prev + 1, Math.max(groupTotalPages, 1))
                    )
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
          {selectedTabId === TAB_PERMISOS && (
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Total permisos: {permTotalRecords}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={permPage <= 1}
                  onClick={() => setPermPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-28 text-center text-sm">
                  Página {permPage} de {Math.max(permTotalPages, 1)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={permPage >= Math.max(permTotalPages, 1)}
                  onClick={() =>
                    setPermPage((prev) =>
                      Math.min(prev + 1, Math.max(permTotalPages, 1))
                    )
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
          {selectedTabId === TAB_MODULOS && (
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Total módulos: {modTotalRecords}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={modPage <= 1}
                  onClick={() => setModPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-28 text-center text-sm">
                  Página {modPage} de {Math.max(modTotalPages, 1)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={modPage >= Math.max(modTotalPages, 1)}
                  onClick={() =>
                    setModPage((prev) =>
                      Math.min(prev + 1, Math.max(modTotalPages, 1))
                    )
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
          {selectedTabId === TAB_SUBMODULOS && (
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Total submódulos: {subTotalRecords}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={subPage <= 1}
                  onClick={() => setSubPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-28 text-center text-sm">
                  Página {subPage} de {Math.max(subTotalPages, 1)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={subPage >= Math.max(subTotalPages, 1)}
                  onClick={() =>
                    setSubPage((prev) =>
                      Math.min(prev + 1, Math.max(subTotalPages, 1))
                    )
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditTarget(null)
          }
        }}
      >
        {renderEditForm()}
      </Dialog>
    </section>
  )
}
