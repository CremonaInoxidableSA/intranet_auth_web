// Este archivo no usa React, por lo que puede importarse desde cualquier lugar

export type ApiConnectionSource = "produccion" | "auth" | "unknown"

export interface ConnectionErrorState {
  hasError: boolean
  failedApis: ApiConnectionSource[]
  messages: string[]
}

type ConnectionErrorListener = (state: ConnectionErrorState) => void

const listeners = new Set<ConnectionErrorListener>()
let currentErrorState: ConnectionErrorState = {
  hasError: false,
  failedApis: [],
  messages: [],
}

export function subscribeToConnectionError(
  listener: ConnectionErrorListener
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function buildConnectionErrorMessage(apiSource: ApiConnectionSource): string {
  switch (apiSource) {
    case "auth":
      return "Error de conexión con api auth"
    case "produccion":
      return "Error de conexión con api produccion"
    default:
      return "Error de conexión con la api"
  }
}

function buildStateFromFailedApis(
  failedApis: ApiConnectionSource[]
): ConnectionErrorState {
  const uniqueFailedApis = Array.from(new Set(failedApis))
  return {
    hasError: uniqueFailedApis.length > 0,
    failedApis: uniqueFailedApis,
    messages: uniqueFailedApis.map((source) =>
      buildConnectionErrorMessage(source)
    ),
  }
}

export function getApiSourceFromUrl(
  input: RequestInfo | URL
): ApiConnectionSource {
  const value =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

  const normalized = value.toLowerCase()

  if (
    normalized.includes("/api/auth/") ||
    normalized.includes("/api/crear/crear-usuario") ||
    normalized.includes("/api/actualizar/actualizar-usuario") ||
    normalized.includes("/api/listas/lista-operarios") ||
    normalized.includes("/api/crear/crear-usuario")
  ) {
    return "auth"
  }

  return "produccion"
}

export function setConnectionError(
  error: boolean,
  apiSource: ApiConnectionSource = "unknown"
) {
  const nextFailedApis = new Set(currentErrorState.failedApis)

  if (error) {
    nextFailedApis.add(apiSource)
  } else if (apiSource === "unknown") {
    nextFailedApis.clear()
  } else {
    nextFailedApis.delete(apiSource)
  }

  const nextState = buildStateFromFailedApis(Array.from(nextFailedApis))

  if (
    currentErrorState.hasError === nextState.hasError &&
    currentErrorState.failedApis.length === nextState.failedApis.length &&
    currentErrorState.failedApis.every(
      (value, index) => value === nextState.failedApis[index]
    )
  ) {
    return
  }

  currentErrorState = nextState
  listeners.forEach((listener) => listener(nextState))
}

export function getConnectionError(): ConnectionErrorState {
  return currentErrorState
}

export function resetConnectionError(apiSource?: ApiConnectionSource) {
  setConnectionError(false, apiSource ?? "unknown")
}

/**
 * Detecta si hay error de conexión en una respuesta
 */
function isConnectionError(data: unknown, statusCode: number): boolean {
  // Status 500 o mayor generalmente indica problema con el servidor
  if (statusCode >= 500) {
    if (typeof data === "string") {
      return (
        data.includes("No se pudo conectar") ||
        data.includes("connection") ||
        data.includes("servidor")
      )
    }

    if (data && typeof data === "object") {
      if ("error" in data && typeof data.error === "string") {
        return (
          data.error.includes("No se pudo conectar") ||
          data.error.includes("connection") ||
          data.error.includes("servidor")
        )
      }
    }

    // Si es un 500 sin mensaje específico, asumimos que es problema de conexión
    return true
  }

  return false
}

/**
 * Wrapper de fetch que detecta automáticamente errores de conexión
 * y los reporta al sistema de monitoreo
 */
export async function fetchWithConnectionCheck(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(input, init)

    // Verificar si es un error de conexión
    if (!response.ok) {
      try {
        const contentType = response.headers.get("content-type")
        let data: unknown = null

        if (contentType && contentType.includes("application/json")) {
          try {
            data = await response.clone().json()
          } catch {
            data = await response.clone().text()
          }
        } else {
          data = await response.clone().text()
        }

        if (isConnectionError(data, response.status)) {
          setConnectionError(true, getApiSourceFromUrl(input))
        }
      } catch {
        // Si no podemos parsear la respuesta, asumimos que es un error de conexión
        if (response.status >= 500) {
          setConnectionError(true, getApiSourceFromUrl(input))
        }
      }
    } else {
      // Respuesta exitosa - resetear error de conexión
      resetConnectionError()
    }

    return response
  } catch (error) {
    // Error de red (TypeError, NetworkError, etc.)
    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        (error.message.includes("fetch") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")))
    ) {
      setConnectionError(true, getApiSourceFromUrl(input))
    }
    throw error
  }
}
