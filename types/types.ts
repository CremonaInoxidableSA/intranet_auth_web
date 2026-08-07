export interface PermisosData {
  nombre?: string
  descripcion?: string
}

export interface ModulosData {
  nombre?: string
  subdominio?: string
  path?: string
  icono?: string
  habilitado?: boolean
}

export interface SubmodulosData {
  nombre?: string
  modulo_padre?: string
  path?: string
  icono?: string
  habilitado?: boolean
}

export interface GruposData {
  nombre?: string
  permisos?: (string | PermisosData)[]
  modulos?: (string | ModulosData)[]
  submodulos?: (string | SubmodulosData)[]
}

export interface UsersData {
  id?: string
  email?: string
  nombre?: string
  apellido?: string
  legajo?: number
  dni?: number
  habilitado?: boolean
  cambiar_password?: boolean
  password?: string
  password_confirmation?: string
  grupos?: (string | GruposData)[]
  modulos?: (string | ModulosData)[]
  submodulos?: (string | SubmodulosData)[]
  modulos_personales?: ModulosPersonales
  submodulos_personales?: SubmodulosPersonales
  permisos?: (string | PermisosData)[]

  apellidoNombre?: string
}

// ─────────────────────────────────────────────────────────────────────────
// TIPOS PARA OPERACIONES CRUD
// ─────────────────────────────────────────────────────────────────────────

// Para listados y detalles (lo que devuelve la API)
export type ApiResponse<T> = T

export interface ApiListResult<T, P = Paginacion> {
  data: T[]
  paginacion: P
}

export interface FetchParams {
  numeroPagina?: number
  filtro?: string | null
}

// Para paginación
export interface Paginacion {
  total_paginas: number
  total_registros: number
}

// Para respuestas de listado paginado
export interface ListadoPaginado<T, P = Paginacion> {
  data: T[]
  paginacion: P
}

// Para respuestas simples de detalle
export type DetalleResponse<T> = T

// Para respuestas de operaciones (crear/editar/eliminar)
export interface OperacionResponse {
  detail: string
}

// ─────────────────────────────────────────────────────────────────────────
// UTILITY TYPES para validación en diferentes contextos
// ─────────────────────────────────────────────────────────────────────────

// Para operaciones de creación (requiere campos mínimos)
export type Crear<T> = Required<Pick<T, keyof T>>

// Para operaciones de edición (todos opcionales excepto identificador)
export type Editar<T> = Partial<T>

// Para listados (solo los campos que normalmente se muestran)
export type Listar<T> = Pick<T, keyof T>

// ─────────────────────────────────────────────────────────────────────────
// CONTEXTOS DE AUTENTICACIÓN Y COMPONENTES
// ─────────────────────────────────────────────────────────────────────────

export interface AuthContextType {
  user: UsersData | null
  loading: boolean
  login: () => Promise<OperacionResponse>
  logout: () => Promise<boolean>
}

export interface UserAvatarProps {
  nombre?: string | null
  apellido?: string | null
  loading?: boolean
  sizeClass?: string
  textClass?: string
}

// ─────────────────────────────────────────────────────────────────────────
// MAPEO DE MÓDULOS PERSONALES (caso específico)
// ─────────────────────────────────────────────────────────────────────────

export interface ModuloPersonal {
  path: string
  icono: string
}

export interface SubmoduloPersonal {
  path: string
  icono: string
}

export type ModulosPersonales = Record<string, ModuloPersonal>
export type SubmodulosPersonales = Record<string, SubmoduloPersonal>
