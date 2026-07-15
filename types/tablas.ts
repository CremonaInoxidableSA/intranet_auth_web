export type Usuarios = [
  {
    email?:string
    username?:string
    nombre:string
    apellido:string
    roles?:string[]
    habilitado:boolean
  }
]