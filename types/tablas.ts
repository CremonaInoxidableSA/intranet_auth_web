export interface UserSession {
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
