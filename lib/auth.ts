import { jwtVerify, type JWTPayload } from "jose"

export interface AuthPayload extends JWTPayload {
  sub?: string
  username?: string
  rol?: string
  [key: string]: unknown
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      "JWT_SECRET no está configurado en las variables de entorno"
    )
  }
  return new TextEncoder().encode(secret)
}

export async function verifyToken(
  token?: string | null
): Promise<AuthPayload | null> {
  if (!token) return null

  try {
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.split(" ", 2)[1]
    }

    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as AuthPayload
  } catch {
    return null
  }
}
