export interface SoftwareRecord {
  computadora: string
  ubicacion: string
  software: string
  version: string
  categoria: string
}

export interface SoftwareApprovalRecord extends SoftwareRecord {
  equipo: string
  aprobado: boolean
}

export interface DbConfig {
  host: string
  user: string
  password: string
  database: string
  port: number
}

export interface FilterParams {
  search?: string
  location?: string
  software?: string
  equipo?: string
  estado?: string
}

export interface SoftwareFilter {
  pattern: RegExp
  replacement: string
}

export interface SoftwareFiltersConfig {
  exclude: RegExp[]
  include?: RegExp[]
  force_exclude?: RegExp[]
  normalize: SoftwareFilter[]
}

export interface StatsData {
  total: number
  filtered: number
  approved?: number
  unapproved?: number
}

export interface ApprovedSoftwareEntry {
  area: string
  puesto: string
  software: string
}

export interface ApprovedSoftwareHierarchy {
  general: string[]
  areas: Map<string, string[]>
  puestos: Map<string, { area: string; software: string[] }>
  computadoras: Map<string, string[]>
}

export interface LocationData {
  ubicacion: string
}

export interface EquipoData {
  equipo: string
}

export interface SoftwareData {
  software: string
}

export interface User {
  user_id: number
  email: string
  nombre: string
  apellido: string
  habilitado: boolean
  dni?: number
  legajo?: number
  grupos?: string[]
  apellidoNombre?: string
}

export interface UserSession {
  id?: number
  email: string
  nombre: string
  apellido: string
  legajo: number
  dni: number

  grupos: string[]
  modulos: string[]
  submodulos: string[]
  permisos: string[]
}

export interface AuthContextType {
  user: UserSession | null
  id: number | null
  email: string | null
  nombre: string | null
  apellido: string | null
  grupos: string[]
  modulos: string[]
  submodulos: string[]
  permisos: string[]
  legajo: number | null
  dni: number | null
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
