"use client"

import { useCallback, useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { fetchWithKeycloak } from "@/lib/keycloak/keycloak-fetch"
import { fetchUsuarios } from "./(data)/usuarios"
import { fetchGrupos } from "./(data)/grupos"
import { fetchModulos, type Modulo } from "./(data)/modulos"
import { fetchSubmodulos, type Submodulo } from "./(data)/submodulos"
import { useAuth } from "@/context/AuthProvider"
import { UsersData, GruposData } from "@/types/types"
import { type DataTableColumn } from "./(table)/data-table"
import {
  getUsuarioColumns,
  getGrupoColumns,
  getModuloColumns,
  getSubmoduloColumns,
} from "./(table)/columns"

type DataItem = UsersData | GruposData | Modulo | Submodulo

type EditTarget = {
  tabId: number
  item?: DataItem | null
  id?: string
}

export const TAB_USUARIOS = 1
export const TAB_GRUPOS = 2
export const TAB_MODULOS = 3
export const TAB_SUBMODULOS = 4

export const tablas = [
  { id: TAB_USUARIOS, nombre: "Lista de Usuarios" },
  { id: TAB_GRUPOS, nombre: "Lista de Grupos" },
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
  const [userTotalUsers, setUserTotalUsers] = useState(0)
  const [groupPage, setGroupPage] = useState(1)
  const [groupFilterInput, setGroupFilterInput] = useState("")
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const [groupTotalPages, setGroupTotalPages] = useState(1)
  const [groupTotalGrupos, setGroupTotalGrupos] = useState(0)
  const [modPage, setModPage] = useState(1)
  const [modFilterInput, setModFilterInput] = useState("")
  const [modFilter, setModFilter] = useState<string | null>(null)
  const [modTotalPages, setModTotalPages] = useState(1)
  const [modTotalModulos, setModTotalModulos] = useState(0)
  const [subPage, setSubPage] = useState(1)
  const [subFilterInput, setSubFilterInput] = useState("")
  const [subFilter, setSubFilter] = useState<string | null>(null)
  const [subTotalPages, setSubTotalPages] = useState(1)
  const [subTotalSubmodulos, setSubTotalSubmodulos] = useState(0)

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
    if (selectedTabId !== TAB_USUARIOS || authLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const usersResponse = await fetchUsuarios(
        { numeroPagina: userPage, filtro: userFilter },
        currentHeaders
      )
      setData(usersResponse.data)
      setUserTotalPages(usersResponse.paginacion.total_paginas)
      setUserTotalUsers(usersResponse.paginacion.total_usuarios)
    } catch {
      setError("Error al cargar los datos")
      setData([])
      setUserTotalPages(1)
      setUserTotalUsers(0)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTabId, authLoading, userPage, userFilter, currentHeaders])

  const loadData = useCallback(async () => {
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
          setUserTotalUsers(usersResponse.paginacion.total_usuarios)
          break
        }
        case TAB_GRUPOS: {
          const grupos = await fetchGrupos(
            { numeroPagina: groupPage, filtro: groupFilter },
            currentHeaders
          )
          setData(grupos.data)
          setGroupTotalPages(grupos.paginacion.total_paginas)
          setGroupTotalGrupos(grupos.paginacion.total_grupos)
          break
        }
        case TAB_MODULOS: {
          const modulos = await fetchModulos(
            { numeroPagina: modPage, filtro: modFilter },
            currentHeaders
          )
          setData(modulos.data)
          setModTotalPages(modulos.paginacion.total_paginas)
          setModTotalModulos(modulos.paginacion.total_modulos)
          break
        }
        case TAB_SUBMODULOS: {
          const submodulos = await fetchSubmodulos(
            { numeroPagina: subPage, filtro: subFilter },
            currentHeaders
          )
          setData(submodulos.data)
          setSubTotalPages(submodulos.paginacion.total_paginas)
          setSubTotalSubmodulos(submodulos.paginacion.total_submodulos)
          break
        }
        default:
          setData([])
          setUserTotalPages(1)
          setUserTotalUsers(0)
      }
    } catch {
      setError("Error al cargar los datos")
      setData([])
      setUserTotalPages(1)
      setUserTotalUsers(0)
    } finally {
      setIsLoading(false)
    }
  }, [
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
    [refetchUsuarios]
  )

  const habilitarUsuario = useCallback(
    async (usuario_id: string) => {
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
    [refetchUsuarios]
  )

  const deshabilitarModulo = useCallback(
    async (modulo_nombre: string) => {
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
    [loadData]
  )

  const habilitarModulo = useCallback(
    async (modulo_nombre: string) => {
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
    [loadData]
  )

  const deshabilitarSubmodulo = useCallback(
    async (submodulo_nombre: string) => {
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
    [loadData]
  )

  const habilitarSubmodulo = useCallback(
    async (submodulo_nombre: string) => {
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
    [loadData]
  )

  const eliminarUsuario = useCallback(
    async (usuario_id: string) => {
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
    [refetchUsuarios]
  )

  const eliminarGrupo = useCallback(
    async (grupo_nombre: string) => {
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
    [loadData]
  )

  const eliminarModulo = useCallback(
    async (modulo_nombre: string) => {
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
    [loadData]
  )

  const eliminarSubmodulo = useCallback(
    async (submodulo_nombre: string) => {
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
    [loadData]
  )

  const editarUsuario = useCallback((id: string | undefined) => {
    setUserIdToEdit(id)
    setEditTarget(null)
    setIsEditDialogOpen(true)
  }, [])

  const editarGrupo = useCallback((grupo: GruposData) => {
    setEditTarget({ tabId: TAB_GRUPOS, item: grupo, id: grupo.nombre })
    setUserIdToEdit(undefined)
    setIsEditDialogOpen(true)
  }, [])

  const editarModulo = useCallback((modulo: Modulo) => {
    setEditTarget({ tabId: TAB_MODULOS, item: modulo, id: modulo.nombre })
    setUserIdToEdit(undefined)
    setIsEditDialogOpen(true)
  }, [])

  const editarSubmodulo = useCallback((submodulo: Submodulo) => {
    setEditTarget({
      tabId: TAB_SUBMODULOS,
      item: submodulo,
      id: submodulo.nombre,
    })
    setUserIdToEdit(undefined)
    setIsEditDialogOpen(true)
  }, [])

  const handleUserCreated = useCallback(async () => {
    await refetchUsuarios()
    setIsCreateDialogOpen(false)
  }, [refetchUsuarios])

  const handleGrupoCreated = useCallback(async () => {
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

  const usuarioColumns = useMemo(
    () =>
      getUsuarioColumns(
        editarUsuario,
        deshabilitarUsuario,
        habilitarUsuario,
        eliminarUsuario
      ),
    [editarUsuario, deshabilitarUsuario, habilitarUsuario, eliminarUsuario]
  )

  const grupoColumns = useMemo(
    () => getGrupoColumns(editarGrupo, eliminarGrupo),
    [editarGrupo, eliminarGrupo]
  )

  const moduloColumns = useMemo(
    () =>
      getModuloColumns(
        editarModulo,
        deshabilitarModulo,
        habilitarModulo,
        eliminarModulo
      ),
    [editarModulo, deshabilitarModulo, habilitarModulo, eliminarModulo]
  )
  const submoduloColumns = useMemo(
    () =>
      getSubmoduloColumns(
        editarSubmodulo,
        deshabilitarSubmodulo,
        habilitarSubmodulo,
        eliminarSubmodulo
      ),
    [
      editarSubmodulo,
      deshabilitarSubmodulo,
      habilitarSubmodulo,
      eliminarSubmodulo,
    ]
  )

  const currentColumns = useMemo<DataTableColumn<DataItem>[]>(() => {
    switch (selectedTabId) {
      case TAB_GRUPOS:
        return grupoColumns as DataTableColumn<DataItem>[]
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
    moduloColumns,
    submoduloColumns,
  ])

  const currentCreateButton = botonesCreacion.find(
    (boton) => boton.id === selectedTabId
  )

  return {
    selectedTabId,
    setSelectedTabId,
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
    userTotalUsers,
    groupPage,
    setGroupPage,
    groupFilterInput,
    setGroupFilterInput,
    groupFilter,
    groupTotalPages,
    groupTotalGrupos,
    modPage,
    setModPage,
    modFilterInput,
    setModFilterInput,
    modFilter,
    modTotalPages,
    modTotalModulos,
    subPage,
    setSubPage,
    subFilterInput,
    setSubFilterInput,
    subFilter,
    subTotalPages,
    subTotalSubmodulos,
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
    aplicarFiltroModulos,
    limpiarFiltroModulos,
    aplicarFiltroSubmodulos,
    limpiarFiltroSubmodulos,
    handleGrupoCreated,
    handleSubmoduloCreated,
    handleGrupoUpdated,
    handleModuloUpdated,
    handleSubmoduloUpdated,
    refetchUsuarios,
    currentColumns,
    currentCreateButton,
  }
}
