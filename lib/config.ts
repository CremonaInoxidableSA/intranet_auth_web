export const middlewarePaths = {
  gestion: process.env.GESTION_URL ?? "/config_usuarios",
} as const

export const urlConfig = {
  /* URL globales */
  externalUrl: "https://creminox.com",
  intranetUrl: process.env.NEXT_PUBLIC_INTRANET_URL ?? "http://localhost:3000",
  homeUrl: "/",
  ticketsUrl:
    "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=bAUtuO0D10ig-npfJshKph4XKh2Ie7xDpjemR7EsG4NUMEFOTzlLNkVVQjU4S0pQRjlJNlRCVzU1MCQlQCN0PWcu",

  /* URL de servicios */
  autodeskUrl: `http://${process.env.IP_AUTODESK}:${process.env.PORT_AUTODESK}${process.env.AUTODESK_URL ?? ""}`,
  softwareAprobadoUrl: `http://${process.env.IP_SOFTWARE_APROBADO}:${process.env.PORT_SOFTWARE_APROBADO}${process.env.SOFTWARE_APROBADO_URL ?? ""}`,
  produccionUrl: `http://${process.env.IP_PRODUCCION}:${process.env.PORT_PRODUCCION}${process.env.PRODUCCION_URL ?? ""}`,
} as const

/* 
Listado de variables de entorno
NEXT_PUBLIC_INTRANET_URL
GESTION_URL
IP_AUTODESK
PORT_AUTODESK
IP_SOFTWARE_APROBADO
PORT_SOFTWARE_APROBADO
IP_PRODUCCION
PORT_PRODUCCION
*/
