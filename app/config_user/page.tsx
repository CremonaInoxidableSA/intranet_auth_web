"use client"

import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Boton, TabsComp } from "@/components/components"
import FormUsuario from "./(formulario)/formUsuario"
import FormRol from "./(formulario)/formRol"
import FormModulo from "./(formulario)/formModulo"
import FormSubmodulo from "./(formulario)/formSubmodulo"
import EditarUsuario from "./(table)/editarUsuario"
import { DataTable, type DataTableColumn } from "./(table)/data-table"
import { useConfiguracionUsuario, tablas, TAB_USUARIOS } from "./funciones"

export default function ConfiguracionUsuario() {
  const {
    selectedTabId,
    setSelectedTabId,
    data,
    isLoading,
    userIdToEdit,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    userPage,
    setUserPage,
    userFilterInput,
    setUserFilterInput,
    userTotalPages,
    userTotalUsers,
    user,
    handleUserCreated,
    handleUserUpdated,
    aplicarFiltroUsuarios,
    limpiarFiltroUsuarios,
    currentColumns,
    currentCreateButton,
  } = useConfiguracionUsuario()

  const renderCreateForm = () => {
    switch (selectedTabId) {
      case TAB_USUARIOS:
        return <FormUsuario onUserCreated={handleUserCreated} />
      case 2: // TAB_GRUPOS
        return <FormRol />
      case 3: // TAB_MODULOS
        return <FormModulo />
      case 4: // TAB_SUBMODULOS
        return <FormSubmodulo />
      default:
        return null
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-5 p-5">
      <div className="flex w-full flex-1 flex-col gap-5">
        <div className="flex w-full flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full flex-col gap-3 xl:w-auto">
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
          </div>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Boton
                extraClass={`${
                  currentCreateButton?.extraClass ??
                  "border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
                } w-full xl:w-auto`}
              >
                {currentCreateButton?.nombre ?? "Crear Usuario"}
              </Boton>
            </DialogTrigger>
            {renderCreateForm()}
          </Dialog>
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
                <div className="flex gap-2">
                  <Button
                    onClick={aplicarFiltroUsuarios}
                    className="border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30"
                  >
                    Filtrar
                  </Button>
                  <Button
                    onClick={limpiarFiltroUsuarios}
                    className="border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30"
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
            disableClientPagination={selectedTabId === TAB_USUARIOS}
            isLoading={isLoading}
            emptyMessage="No hay registros disponibles"
            loadingMessage="Cargando datos..."
            showPageInfo={selectedTabId === TAB_USUARIOS}
          />
          {selectedTabId === TAB_USUARIOS && (
            <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <span className="text-sm font-semibold text-muted-foreground">
                Total usuarios: {userTotalUsers}
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
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {userIdToEdit !== undefined && user?.extra?.id !== undefined && (
          <EditarUsuario
            onUserCreated={handleUserUpdated}
            userIdToEdit={userIdToEdit}
          />
        )}
      </Dialog>
    </section>
  )
}
