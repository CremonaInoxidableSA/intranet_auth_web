export const SUBMODULOS = {
  config_user: "SUBMODULO_CONFIG_USUARIOS",
} as const

export type SubmoduloNombre = (typeof SUBMODULOS)[keyof typeof SUBMODULOS]
