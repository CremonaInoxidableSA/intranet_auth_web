"use client"

import { useCallback, useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import { fetchUsuarios } from "./(data)/usuarios"
import { fetchGrupos } from "./(data)/grupos"
import { fetchModulos } from "./(data)/modulos"
import { fetchPermisos } from "./(data)/permisos"
import { fetchSubmodulos } from "./(data)/submodulos"
import { useAuth } from "@/context/AuthProvider"
import {
  UsersData,
  GruposData,
  PermisosData,
  SubmodulosData,
  ModulosData,
} from "@/types/types"
import { type DataTableColumn } from "./(table)/data-table"
import {
  getUsuarioColumns,
  getGrupoColumns,
  getModuloColumns,
  getSubmoduloColumns,
  getPermisoColumns,
} from "./(table)/columns"
import { useAutorizacion } from "@/context/useAutorizacion"

type DataItem =
  | UsersData
  | GruposData
  | ModulosData
  | SubmodulosData
  | PermisosData

type EditTarget = {
  tabId: number
  item?: DataItem | null
  id?: string
}

export const TAB_USUARIOS = 1
export const TAB_GRUPOS = 2
export const TAB_PERMISOS = 3
export const TAB_MODULOS = 4
export const TAB_SUBMODULOS = 5

export const tablas = [
  { id: TAB_USUARIOS, nombre: "Lista de Usuarios" },
  { id: TAB_GRUPOS, nombre: "Lista de Grupos" },
  { id: TAB_PERMISOS, nombre: "Lista de Permisos" },
  { id: TAB_MODULOS, nombre: "Lista de Modulos" },
  { id: TAB_SUBMODULOS, nombre: "Lista de Submodulos" },
]

export const botonesCreacion = [
  {
    id: TAB_USUARIOS,
    nombre: "Crear Usuario",
    extraClass:
      "border-redcremona bg-redcremona/20 text-redcremona hover:bg-redcremona/30",
  },
  {
    id: TAB_GRUPOS,
    nombre: "Crear Grupo",
    extraClass:
      "border-bluecremona bg-bluecremona/20 text-bluecremona hover:bg-bluecremona/30",
  },
  {
    id: TAB_PERMISOS,
    nombre: "Crear Permiso",
    extraClass:
      "border-purplecremona bg-purplecremona/20 text-purplecremona hover:bg-purplecremona/30",
  },
  {
    id: TAB_MODULOS,
    nombre: "Agregar Modulo",
    extraClass:
      "border-greencremona bg-greencremona/20 text-greencremona hover:bg-greencremona/30",
  },
  {
    id: TAB_SUBMODULOS,
    nombre: "Agregar Submodulo",
    extraClass:
      "border-orangecremona bg-orangecremona/20 text-orangecremona hover:bg-orangecremona/30",
  },
]

export function useConfiguracionUsuario() {
  const { user, loading: authLoading } = useAuth()
  const { autorizacion } = useAutorizacion()
  const [selectedTabId, setSelectedTabId] = useState(tablas[0].id)
  const [data, setData] = useState<DataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userIdToEdit, setUserIdToEdit] = useState<string | undefined>(
    undefined
  )
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [userPage, setUserPage] = useState(1)
  const [userFilterInput, setUserFilterInput] = useState("")
  const [userFilter, setUserFilter] = useState<string | null>(null)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userTotalRecords, setUserTotalRecords] = useState(0)
  const [groupPage, setGroupPage] = useState(1)
  const [groupFilterInput, setGroupFilterInput] = useState("")
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const [groupTotalPages, setGroupTotalPages] = useState(1)
  const [groupTotalRecords, setGroupTotalRecords] = useState(0)
  const [modPage, setModPage] = useState(1)
  const [modFilterInput, setModFilterInput] = useState("")
  const [modFilter, setModFilter] = useState<string | null>(null)
  const [modTotalPages, setModTotalPages] = useState(1)
  const [modTotalRecords, setModTotalRecords] = useState(0)
  const [subPage, setSubPage] = useState(1)
  const [subFilterInput, setSubFilterInput] = useState("")
  const [subFilter, setSubFilter] = useState<string | null>(null)
  const [subTotalPages, setSubTotalPages] = useState(1)
  const [subTotalRecords, setSubTotalRecords] = useState(0)
  const [permPage, setPermPage] = useState(1)
  const [permFilterInput, setPermFilterInput] = useState("")
  const [permFilter, setPermFilter] = useState<string | null>(null)
  const [permTotalPages, setPermTotalPages] = useState(1)
  const [permTotalRecords, setPermTotalRecords] = useState(0)

  const canViewTab = useCallback(
    (tabId: number) => {
      switch (tabId) {
        case TAB_USUARIOS:
          return autorizacion.usuarios.consultar
        case TAB_GRUPOS:
          return autorizacion.grupos.consultar
        case TAB_PERMISOS:
          return autorizacion.permisos.consultar
        case TAB_MODULOS:
          return autorizacion.modulos.consultar
        case TAB_SUBMODULOS:
          return autorizacion.submodulos.consultar
        default:
          return false
      }
    },
    [autorizacion]
  )

  const canCreateInTab = useCallback(
    (tabId: number) => {
      switch (tabId) {
        case TAB_USUARIOS:
          return autorizacion.usuarios.crear
        case TAB_GRUPOS:
          return autorizacion.grupos.crear
        case TAB_PERMISOS:
          return autorizacion.permisos.crear
        case TAB_MODULOS:
          return autorizacion.modulos.crear
        case TAB_SUBMODULOS:
          return autorizacion.submodulos.crear
        default:
          return false
      }
    },
    [autorizacion]
  )

  const tablasDisponibles = useMemo(
    () => tablas.filter((tab) => canViewTab(tab.id)),
    [canViewTab]
  )

  useEffect(() => {
    if (tablasDisponibles.length === 0) {
      setData([])
      setIsLoading(false)
      return
    }

    const tabActualVisible = tablasDisponibles.some(
      (tab) => tab.id === selectedTabId
    )

    if (!tabActualVisible) {
      setSelectedTabId(tablasDisponibles[0].id)
    }
  }, [selectedTabId, tablasDisponibles])

  const createHeaders = (tabId: number): Record<string, string> => {
    if (tabId === TAB_USUARIOS) {
      return { "Content-Type": "application/json" }
    }
    return { Accept: "application/json" }
  }

  const currentHeaders = useMemo(
    () => createHeaders(selectedTabId),
    [selectedTabId]
  )

  const refetchUsuarios = useCallback(async () => {
    if (
      selectedTabId !== TAB_USUARIOS ||
      authLoading ||
      !autorizacion.usuarios.consultar
    ) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const usersResponse = await fetchUsuarios(
        { numeroPagina: userPage, filtro: userFilter },
        currentHeaders
      )
      setData(usersResponse.data)
      setUserTotalPages(usersResponse.paginacion.total_paginas)
      setUserTotalRecords(usersResponse.paginacion.total_registros)
    } catch {
      setError("Error al cargar los datos")
      setData([])
      setUserTotalPages(1)
      setUserTotalRecords(0)
    } finally {
      setIsLoading(false)
    }
  }, [
    selectedTabId,
    authLoading,
    userPage,
    userFilter,
    currentHeaders,
    autorizacion.usuarios.consultar,
  ])

  const loadData = useCallback(async () => {
    if (!canViewTab(selectedTabId)) {
      setData([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      switch (selectedTabId) {
        case TAB_USUARIOS: {
          const usersResponse = await fetchUsuarios(
            { numeroPagina: userPage, filtro: userFilter },
            currentHeaders
          )
          setData(usersResponse.data)
          setUserTotalPages(usersResponse.paginacion.total_paginas)
          setUserTotalRecords(usersResponse.paginacion.total_registros)
          break
        }
        case TAB_GRUPOS: {
          const grupos = await fetchGrupos(
            { numeroPagina: groupPage, filtro: groupFilter },
            currentHeaders
          )
          setData(grupos.data)
          setGroupTotalPages(grupos.paginacion.total_paginas)
          setGroupTotalRecords(grupos.paginacion.total_registros)
          break
        }
        case TAB_MODULOS: {
          const modulos = await fetchModulos(
            { numeroPagina: modPage, filtro: modFilter },
            currentHeaders
          )
          setData(modulos.data)
          setModTotalPages(modulos.paginacion.total_paginas)
          setModTotalRecords(modulos.paginacion.total_registros)
          break
        }
        case TAB_SUBMODULOS: {
          const submodulos = await fetchSubmodulos(
            { numeroPagina: subPage, filtro: subFilter },
            currentHeaders
          )
          setData(submodulos.data)
          setSubTotalPages(submodulos.paginacion.total_paginas)
          setSubTotalRecords(submodulos.paginacion.total_registros)
          break
        }
        case TAB_PERMISOS: {
          const permisos = await fetchPermisos(
            { numeroPagina: permPage, filtro: permFilter },
            currentHeaders
          )
          setData(permisos.data)
          setPermTotalPages(permisos.paginacion.total_paginas)
          setPermTotalRecords(permisos.paginacion.total_registros)
          break
        }
        default:
          setData([])
          setUserTotalPages(1)
          setUserTotalRecords(0)
      }
    } catch {
      setError("Error al cargar los datos")
      setData([])
      setUserTotalPages(1)
      setUserTotalRecords(0)
    } finally {
      setIsLoading(false)
    }
  }, [
    canViewTab,
    selectedTabId,
    currentHeaders,
    userPage,
    userFilter,
    groupPage,
    groupFilter,
    modPage,
    modFilter,
    subPage,
    subFilter,
    permPage,
    permFilter,
  ])

  useEffect(() => {
    let mounted = true
    let rafId: number | undefined

    if (authLoading) {
      rafId = requestAnimationFrame(() => {
        if (mounted) {
          setIsLoading(true)
        }
      })
      return () => {
        mounted = false
        if (rafId) cancelAnimationFrame(rafId)
      }
    }

    const runLoadData = async () => {
      await loadData()
    }

    void runLoadData()

    return () => {
      mounted = false
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [authLoading, loadData])

  const deshabilitarUsuario = useCallback(
    async (usuario_id: string) => {
      if (!autorizacion.usuarios.deshabilitar) {
        toast.error("No autorizado para deshabilitar usuarios")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/usuarios/deshabilitar?user_id=${encodeURIComponent(usuario_id)}`,
          {
            method: "PUT",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json()
        if (!res.ok) {
          toast.error(
            result.error || result.detail || "Error al deshabilitar el usuario"
          )
          return
        }

        await refetchUsuarios()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [refetchUsuarios, autorizacion.usuarios.deshabilitar]
  )

  const habilitarUsuario = useCallback(
    async (usuario_id: string) => {
      if (!autorizacion.usuarios.habilitar) {
        toast.error("No autorizado para habilitar usuarios")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/usuarios/habilitar?user_id=${encodeURIComponent(usuario_id)}`,
          {
            method: "PUT",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al habilitar el usuario"
          )
          return
        }

        await refetchUsuarios()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [refetchUsuarios, autorizacion.usuarios.habilitar]
  )

  const deshabilitarModulo = useCallback(
    async (modulo_nombre: string) => {
      if (!autorizacion.modulos.deshabilitar) {
        toast.error("No autorizado para deshabilitar modulos")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/permisos/modulos/deshabilitar?modulo_nombre=${encodeURIComponent(modulo_nombre)}`,
          {
            method: "PUT",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al deshabilitar el módulo"
          )
          return
        }

        await loadData()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [loadData, autorizacion.modulos.deshabilitar]
  )

  const habilitarModulo = useCallback(
    async (modulo_nombre: string) => {
      if (!autorizacion.modulos.habilitar) {
        toast.error("No autorizado para habilitar modulos")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/permisos/modulos/habilitar?modulo_nombre=${encodeURIComponent(modulo_nombre)}`,
          {
            method: "PUT",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al habilitar el módulo"
          )
          return
        }

        await loadData()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [loadData, autorizacion.modulos.habilitar]
  )

  const deshabilitarSubmodulo = useCallback(
    async (submodulo_nombre: string) => {
      if (!autorizacion.submodulos.deshabilitar) {
        toast.error("No autorizado para deshabilitar submodulos")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/permisos/submodulos/deshabilitar?submodulo_nombre=${encodeURIComponent(submodulo_nombre)}`,
          {
            method: "PUT",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error ||
              result?.detail ||
              "Error al deshabilitar el submódulo"
          )
          return
        }

        await loadData()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [loadData, autorizacion.submodulos.deshabilitar]
  )

  const habilitarSubmodulo = useCallback(
    async (submodulo_nombre: string) => {
      if (!autorizacion.submodulos.habilitar) {
        toast.error("No autorizado para habilitar submodulos")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/permisos/submodulos/habilitar?submodulo_nombre=${encodeURIComponent(submodulo_nombre)}`,
          {
            method: "PUT",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al habilitar el submódulo"
          )
          return
        }

        await loadData()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [loadData, autorizacion.submodulos.habilitar]
  )

  const eliminarUsuario = useCallback(
    async (usuario_id: string) => {
      if (!autorizacion.usuarios.eliminar) {
        toast.error("No autorizado para eliminar usuarios")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/usuarios/eliminar?user_id=${encodeURIComponent(usuario_id)}`,
          {
            method: "DELETE",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al eliminar el usuario"
          )
          return
        }

        await refetchUsuarios()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [refetchUsuarios, autorizacion.usuarios.eliminar]
  )

  const eliminarGrupo = useCallback(
    async (grupo_nombre: string) => {
      if (!autorizacion.grupos.eliminar) {
        toast.error("No autorizado para eliminar grupos")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/permisos/grupos/eliminar?grupo_nombre=${encodeURIComponent(grupo_nombre)}`,
          {
            method: "DELETE",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al eliminar el grupo"
          )
          return
        }

        await loadData()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [loadData, autorizacion.grupos.eliminar]
  )

  const eliminarPermiso = useCallback(
    async (permiso_nombre: string) => {
      if (!autorizacion.permisos.eliminar) {
        toast.error("No autorizado para eliminar permisos")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/permisos/permisos/eliminar?permiso_nombre=${encodeURIComponent(
            permiso_nombre
          )}`,
          {
            method: "DELETE",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al eliminar el permiso"
          )
          return
        }

        await loadData()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [loadData, autorizacion.permisos.eliminar]
  )

  const eliminarModulo = useCallback(
    async (modulo_nombre: string) => {
      if (!autorizacion.modulos.eliminar) {
        toast.error("No autorizado para eliminar modulos")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/permisos/modulos/eliminar?modulo_nombre=${encodeURIComponent(modulo_nombre)}`,
          {
            method: "DELETE",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al eliminar el módulo"
          )
          return
        }

        await loadData()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [loadData, autorizacion.modulos.eliminar]
  )

  const eliminarSubmodulo = useCallback(
    async (submodulo_nombre: string) => {
      if (!autorizacion.submodulos.eliminar) {
        toast.error("No autorizado para eliminar submodulos")
        return
      }

      try {
        const res = await fetchWithKeycloak(
          `/api/permisos/submodulos/eliminar?submodulo_nombre=${encodeURIComponent(submodulo_nombre)}`,
          {
            method: "DELETE",
            headers: { Accept: "application/json" },
          }
        )

        const result = await res.json().catch(() => null)
        if (!res.ok) {
          toast.error(
            result?.error || result?.detail || "Error al eliminar el submódulo"
          )
          return
        }

        await loadData()
      } catch {
        toast.error("Error de conexión con la API")
      }
    },
    [loadData, autorizacion.submodulos.eliminar]
  )

  const editarUsuario = useCallback(
    (id: string | undefined) => {
      if (!autorizacion.usuarios.editar) {
        toast.error("No autorizado para editar usuarios")
        return
      }

      setUserIdToEdit(id)
      setEditTarget(null)
      setIsEditDialogOpen(true)
    },
    [autorizacion.usuarios.editar]
  )

  const editarGrupo = useCallback(
    (grupo: GruposData) => {
      if (!autorizacion.grupos.editar) {
        toast.error("No autorizado para editar grupos")
        return
      }

      setEditTarget({ tabId: TAB_GRUPOS, item: grupo, id: grupo.nombre })
      setUserIdToEdit(undefined)
      setIsEditDialogOpen(true)
    },
    [autorizacion.grupos.editar]
  )

  const editarModulo = useCallback(
    (modulo: ModulosData) => {
      if (!autorizacion.modulos.editar) {
        toast.error("No autorizado para editar modulos")
        return
      }

      setEditTarget({ tabId: TAB_MODULOS, item: modulo, id: modulo.nombre })
      setUserIdToEdit(undefined)
      setIsEditDialogOpen(true)
    },
    [autorizacion.modulos.editar]
  )

  const editarSubmodulo = useCallback(
    (submodulo: SubmodulosData) => {
      if (!autorizacion.submodulos.editar) {
        toast.error("No autorizado para editar submodulos")
        return
      }

      setEditTarget({
        tabId: TAB_SUBMODULOS,
        item: submodulo,
        id: submodulo.nombre,
      })
      setUserIdToEdit(undefined)
      setIsEditDialogOpen(true)
    },
    [autorizacion.submodulos.editar]
  )

  const editarPermiso = useCallback(
    (permiso: PermisosData) => {
      if (!autorizacion.permisos.editar) {
        toast.error("No autorizado para editar permisos")
        return
      }

      setEditTarget({
        tabId: TAB_PERMISOS,
        item: permiso,
        id: permiso.nombre,
      })
      setUserIdToEdit(undefined)
      setIsEditDialogOpen(true)
    },
    [autorizacion.permisos.editar]
  )

  const handleUserCreated = useCallback(async () => {
    await refetchUsuarios()
    setIsCreateDialogOpen(false)
  }, [refetchUsuarios])

  const handleGrupoCreated = useCallback(async () => {
    await loadData()
    setIsCreateDialogOpen(false)
  }, [loadData])

  const handleModuloCreated = useCallback(async () => {
    await loadData()
    setIsCreateDialogOpen(false)
  }, [loadData])

  const handleSubmoduloCreated = useCallback(async () => {
    await loadData()
    setIsCreateDialogOpen(false)
  }, [loadData])

  const handleUserUpdated = useCallback(async () => {
    setIsEditDialogOpen(false)
    setEditTarget(null)
    setUserIdToEdit(undefined)
    await refetchUsuarios()
  }, [refetchUsuarios])

  const handleGrupoUpdated = useCallback(async () => {
    setIsEditDialogOpen(false)
    setEditTarget(null)
    await loadData()
  }, [loadData])

  const handleModuloUpdated = useCallback(async () => {
    setIsEditDialogOpen(false)
    setEditTarget(null)
    await loadData()
  }, [loadData])

  const handleSubmoduloUpdated = useCallback(async () => {
    setIsEditDialogOpen(false)
    setEditTarget(null)
    await loadData()
  }, [loadData])

  const handlePermisoCreated = useCallback(async () => {
    await loadData()
    setIsCreateDialogOpen(false)
  }, [loadData])

  const handlePermisoUpdated = useCallback(async () => {
    setIsEditDialogOpen(false)
    setEditTarget(null)
    await loadData()
  }, [loadData])

  const aplicarFiltroUsuarios = useCallback(() => {
    setUserPage(1)
    const parsedFiltro = userFilterInput.trim()
    setUserFilter(parsedFiltro === "" ? null : parsedFiltro)
  }, [userFilterInput])

  const limpiarFiltroUsuarios = useCallback(() => {
    setUserFilterInput("")
    setUserFilter(null)
    setUserPage(1)
  }, [])

  const aplicarFiltroGrupos = useCallback(() => {
    setGroupPage(1)
    const parsedFiltro = groupFilterInput.trim()
    setGroupFilter(parsedFiltro === "" ? null : parsedFiltro)
  }, [groupFilterInput])

  const limpiarFiltroGrupos = useCallback(() => {
    setGroupFilterInput("")
    setGroupFilter(null)
    setGroupPage(1)
  }, [])

  const aplicarFiltroModulos = useCallback(() => {
    setModPage(1)
    const parsedFiltro = modFilterInput.trim()
    setModFilter(parsedFiltro === "" ? null : parsedFiltro)
  }, [modFilterInput])

  const limpiarFiltroModulos = useCallback(() => {
    setModFilterInput("")
    setModFilter(null)
    setModPage(1)
  }, [])

  const aplicarFiltroSubmodulos = useCallback(() => {
    setSubPage(1)
    const parsedFiltro = subFilterInput.trim()
    setSubFilter(parsedFiltro === "" ? null : parsedFiltro)
  }, [subFilterInput])

  const limpiarFiltroSubmodulos = useCallback(() => {
    setSubFilterInput("")
    setSubFilter(null)
    setSubPage(1)
  }, [])

  const aplicarFiltroPermisos = useCallback(() => {
    setPermPage(1)
    const parsedFiltro = permFilterInput.trim()
    setPermFilter(parsedFiltro === "" ? null : parsedFiltro)
  }, [permFilterInput])

  const limpiarFiltroPermisos = useCallback(() => {
    setPermFilterInput("")
    setPermFilter(null)
    setPermPage(1)
  }, [])

  const usuarioColumns = useMemo(() => {
    const showUserActions =
      autorizacion.usuarios.editar ||
      autorizacion.usuarios.habilitar ||
      autorizacion.usuarios.deshabilitar ||
      autorizacion.usuarios.cambiarContrasena ||
      autorizacion.usuarios.eliminar

    return getUsuarioColumns(
      editarUsuario,
      deshabilitarUsuario,
      habilitarUsuario,
      eliminarUsuario,
      showUserActions
    )
  }, [
    editarUsuario,
    deshabilitarUsuario,
    habilitarUsuario,
    eliminarUsuario,
    autorizacion.usuarios.editar,
    autorizacion.usuarios.habilitar,
    autorizacion.usuarios.deshabilitar,
    autorizacion.usuarios.cambiarContrasena,
    autorizacion.usuarios.eliminar,
  ])

  const grupoColumns = useMemo(
    () =>
      getGrupoColumns(
        editarGrupo,
        eliminarGrupo,
        autorizacion.grupos.editar || autorizacion.grupos.eliminar
      ),
    [
      editarGrupo,
      eliminarGrupo,
      autorizacion.grupos.editar,
      autorizacion.grupos.eliminar,
    ]
  )

  const permisoColumns = useMemo(
    () =>
      getPermisoColumns(
        editarPermiso,
        eliminarPermiso,
        autorizacion.permisos.editar || autorizacion.permisos.eliminar
      ),
    [
      editarPermiso,
      eliminarPermiso,
      autorizacion.permisos.editar,
      autorizacion.permisos.eliminar,
    ]
  )

  const moduloColumns = useMemo(() => {
    const showModuleActions =
      autorizacion.modulos.editar ||
      autorizacion.modulos.habilitar ||
      autorizacion.modulos.deshabilitar ||
      autorizacion.modulos.eliminar

    return getModuloColumns(
      editarModulo,
      deshabilitarModulo,
      habilitarModulo,
      eliminarModulo,
      showModuleActions
    )
  }, [
    editarModulo,
    deshabilitarModulo,
    habilitarModulo,
    eliminarModulo,
    autorizacion.modulos.editar,
    autorizacion.modulos.habilitar,
    autorizacion.modulos.deshabilitar,
    autorizacion.modulos.eliminar,
  ])
  const submoduloColumns = useMemo(() => {
    const showSubmoduleActions =
      autorizacion.submodulos.editar ||
      autorizacion.submodulos.habilitar ||
      autorizacion.submodulos.deshabilitar ||
      autorizacion.submodulos.eliminar

    return getSubmoduloColumns(
      editarSubmodulo,
      deshabilitarSubmodulo,
      habilitarSubmodulo,
      eliminarSubmodulo,
      showSubmoduleActions
    )
  }, [
    editarSubmodulo,
    deshabilitarSubmodulo,
    habilitarSubmodulo,
    eliminarSubmodulo,
    autorizacion.submodulos.editar,
    autorizacion.submodulos.habilitar,
    autorizacion.submodulos.deshabilitar,
    autorizacion.submodulos.eliminar,
  ])

  const currentColumns = useMemo<DataTableColumn<DataItem>[]>(() => {
    switch (selectedTabId) {
      case TAB_GRUPOS:
        return grupoColumns as DataTableColumn<DataItem>[]
      case TAB_PERMISOS:
        return permisoColumns as DataTableColumn<DataItem>[]
      case TAB_MODULOS:
        return moduloColumns as DataTableColumn<DataItem>[]
      case TAB_SUBMODULOS:
        return submoduloColumns as DataTableColumn<DataItem>[]
      default:
        return usuarioColumns as DataTableColumn<DataItem>[]
    }
  }, [
    selectedTabId,
    usuarioColumns,
    grupoColumns,
    permisoColumns,
    moduloColumns,
    submoduloColumns,
  ])

  const currentCreateButton = botonesCreacion.find(
    (boton) => boton.id === selectedTabId && canCreateInTab(boton.id)
  )

  return {
    selectedTabId,
    setSelectedTabId,
    tablas: tablasDisponibles,
    data,
    isLoading,
    error,
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
    userFilter,
    userTotalPages,
    userTotalRecords,
    groupPage,
    setGroupPage,
    groupFilterInput,
    setGroupFilterInput,
    groupFilter,
    groupTotalPages,
    groupTotalRecords,
    modPage,
    setModPage,
    modFilterInput,
    setModFilterInput,
    modFilter,
    modTotalPages,
    modTotalRecords,
    subPage,
    setSubPage,
    subFilterInput,
    setSubFilterInput,
    subFilter,
    subTotalPages,
    subTotalRecords,
    user,
    authLoading,
    deshabilitarUsuario,
    habilitarUsuario,
    editarUsuario,
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
    handleSubmoduloCreated,
    handlePermisoCreated,
    handleGrupoUpdated,
    handlePermisoUpdated,
    handleModuloUpdated,
    handleSubmoduloUpdated,
    refetchUsuarios,
    eliminarUsuario,
    currentColumns,
    currentCreateButton,
    permPage,
    setPermPage,
    permFilterInput,
    setPermFilterInput,
    permFilter,
    setPermFilter,
    permTotalPages,
    permTotalRecords,
  }
}
