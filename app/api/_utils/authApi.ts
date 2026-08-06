const API_AUTH_URL = process.env.NEXT_PUBLIC_API_AUTH_URL

function getApiAuthBaseUrl(): string | null {
  if (!API_AUTH_URL) {
    return null
  }

  return API_AUTH_URL.replace(/\/$/, "")
}

export function getExternalApiUrl(path: string): string | null {
  const baseUrl = getApiAuthBaseUrl()

  if (!baseUrl) {
    return null
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
