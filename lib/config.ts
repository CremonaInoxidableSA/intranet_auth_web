export const siteConfig = {
  homeUrl: process.env.NEXT_PUBLIC_HOME_URL ?? "/",
  externalUrl: "https://creminox.com",
} as const

export const moduleRoutes = {
  autodesk: process.env.AUTODESK_URL ?? "/",
  softwareAprobado: process.env.SOFTWARE_APROBADO_URL ?? "/",
  produccion: process.env.PRODUCCION_URL ?? "/",
} as const