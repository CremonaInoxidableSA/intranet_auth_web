// Data extra de los usuarios que se utiliza para la gestion de usuarios
interface UsersExtraData {
  id?: string
  habilitado?: boolean
  apellidoNombre?: string
  change_password?: boolean
}

// Data que se obtiene de la API al iniciar sesion
export interface UsersData<T = UsersExtraData> {
  email?: string
  nombre?: string
  apellido?: string
  legajo?: number
  dni?: number

  grupos?: GruposData[]
  submodulos?: SubmodulosData[]
  modulos?: ModulosData[]
  permisos?: PermisosData[]

  extra?: T
}

export interface GruposData {
  nombre?: string
}

export interface ModulosData {
  nombre?: string
  subdominio?: string
  path?: string
  icono?: string
}

export interface SubmodulosData {
  modulo_padre?: string
  nombre?: string
  path?: string
  icono?: string
}

export interface PermisosData {
  nombre?: string
}

export interface AuthContextType {
  user: UsersData | null

  loading: boolean

  login: () => Promise<ApiResponse>
  logout: () => Promise<boolean>
}

export interface ApiResponse {
  success: boolean
  data?: unknown
  error?: string
  message?: string
}

export interface UserAvatarProps {
  nombre?: string | null
  apellido?: string | null
  loading?: boolean
  sizeClass?: string
  textClass?: string
}

// Info de paginación, reusable en cualquier listado paginado
export interface PaginacionBase {
  total_paginas: number
}

export interface Paginacion extends PaginacionBase {
  total_usuarios: number
}

export interface GruposPaginacion extends PaginacionBase {
  total_grupos: number
}

export interface ModulosPaginacion extends PaginacionBase {
  total_modulos: number
}

export interface SubmodulosPaginacion extends PaginacionBase {
  total_submodulos: number
}

// Respuesta genérica de un endpoint de listado paginado
export interface ApiListResult<T, P extends PaginacionBase = Paginacion> {
  data: T[]
  paginacion: P
}
