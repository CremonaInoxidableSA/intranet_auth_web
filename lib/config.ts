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

} as const

/* 
Listado de variables de entorno
NEXT_PUBLIC_INTRANET_URL
GESTION_URL
*/
