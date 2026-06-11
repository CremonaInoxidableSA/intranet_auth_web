const hosts = {
  localHost: `http://${process.env.NEXT_PUBLIC_IP}:${process.env.NEXT_PUBLIC_PORT}`,
}

export const middlewarePaths = {
  login: process.env.LOGIN_URL ?? "/login",
  recuperacion: process.env.RECUPERACION_URL ?? "/recuperacion",
  resetPassword: process.env.RESET_PASSWORD_URL ?? "/reset_pass",
  gestion: process.env.GESTION_URL ?? "/config_user",
} as const

export const urlConfig = {
  /* URL globales */
  externalUrl: "https://creminox.com",
  intranetUrl: process.env.NEXT_PUBLIC_INTRANET_URL ?? "http://localhost:3000",
  homeUrl: "/",

  /* URL de módulos */
  gestionUrl: `${hosts.localHost}${process.env.GESTION_URL ?? ""}`,
  loginUrl: `${hosts.localHost}${process.env.LOGIN_URL ?? ""}`,
  recuperacionUrl: `${hosts.localHost}${process.env.LOGIN_URL ?? ""}${process.env.RECUPERACION_URL ?? ""}`,
  resetPasswordUrl: `${hosts.localHost}${process.env.LOGIN_URL ?? ""}${process.env.RECUPERACION_URL ?? ""}${process.env.RESET_PASSWORD_URL ?? ""}`,

  /* URL de servicios */
  autodeskUrl: `http://${process.env.IP_AUTODESK}:${process.env.PORT_AUTODESK}${process.env.AUTODESK_URL ?? ""}`,
  softwareAprobadoUrl: `http://${process.env.IP_SOFTWARE_APROBADO}:${process.env.PORT_SOFTWARE_APROBADO}${process.env.SOFTWARE_APROBADO_URL ?? ""}`,
  produccionUrl: `http://${process.env.IP_PRODUCCION}:${process.env.PORT_PRODUCCION}${process.env.PRODUCCION_URL ?? ""}`,
} as const

/* 
Listado de variables de entorno
NEXT_PUBLIC_IP
NEXT_PUBLIC_PORT
NEXT_PUBLIC_LOGIN_URL
NEXT_PUBLIC_RECUPERACION_URL
NEXT_PUBLIC_RESET_PASSWORD_URL
GESTION_URL
IP_AUTODESK
PORT_AUTODESK
IP_SOFTWARE_APROBADO
PORT_SOFTWARE_APROBADO
IP_PRODUCCION
PORT_PRODUCCION
*/