// Data extra de los usuarios que se utiliza para la gestion de usuarios
interface UsersExtraData {
  id?: string
  enabled?: boolean
  apellidoNombre?: string
}

// Data que se obtiene de la API al iniciar sesion
export interface UsersData<T = UsersExtraData> {
  email?: string
  nombre?: string
  apellido?: string
  legajo?: number
  dni?: number

  grupos?: string[]
  submodulos?: string[]
  modulos?: string[]
  permisos?: string[]

  extra?: T
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
export interface Paginacion {
  total_paginas: number
  total_usuarios: number
}

// Respuesta genérica de un endpoint de listado paginado
export interface ApiListResult<T> {
  data: T[]
  paginacion: Paginacion
}
