import { invalidateSetupCache } from "@/lib/setup-cache"

type Props = {
  params: Promise<{ path: string[] }>
}

function getBaseUrl(): string {
  const raw = process.env.API_AUTH_URL ?? ""
  if (!raw) {
    throw new Error(
      "API_AUTH_URL no está configurada en las variables de entorno"
    )
  }
  return raw.startsWith("http") ? raw : `http://${raw}`
}

function buildHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const cookie = request.headers.get("cookie")
  if (cookie) headers["Cookie"] = cookie
  const auth = request.headers.get("authorization")
  if (auth) headers["Authorization"] = auth
  return headers
}

async function proxyRequest(
  request: Request,
  props: Props,
  method: string,
  withBody = false
): Promise<Response> {
  try {
    const { path } = await props.params
    const { search } = new URL(request.url)
    const fullUrl = `${getBaseUrl()}/${path.join("/")}${search}`

    let body: string | undefined
    if (withBody) {
      const contentLength = request.headers.get("content-length")
      if (contentLength && Number(contentLength) > 0) {
        try {
          const jsonBody = await request.json()
          body = JSON.stringify(jsonBody)
        } catch {
          const textBody = await request.text()
          if (textBody) body = textBody
        }
      }
    }

    const backendResponse = await fetch(fullUrl, {
      method,
      headers: buildHeaders(request),
      body,
    })

    const text = await backendResponse.text()
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }

    const isCreateSuperadmin =
      path.join("/") === "auth/create-superadmin" && method === "POST"
    if (isCreateSuperadmin && backendResponse.ok) {
      const result = data as { success?: boolean }
      if (result?.success) {
        invalidateSetupCache()
      }
    }

    const response = Response.json(data, { status: backendResponse.status })

    const setCookie = backendResponse.headers.get("set-cookie")
    if (setCookie) {
      const cookieValue = setCookie
        .replace(/;\s*httponly/gi, "")
        .replace(/;\s*secure/gi, "")

      response.headers.set("set-cookie", cookieValue)
    }

    return response
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export const GET = (req: Request, props: Props) =>
  proxyRequest(req, props, "GET")
export const POST = (req: Request, props: Props) =>
  proxyRequest(req, props, "POST", true)
export const PUT = (req: Request, props: Props) =>
  proxyRequest(req, props, "PUT", true)
export const DELETE = (req: Request, props: Props) =>
  proxyRequest(req, props, "DELETE", true)
export const PATCH = (req: Request, props: Props) =>
  proxyRequest(req, props, "PATCH", true)
