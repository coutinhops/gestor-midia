import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)
const COOKIE_NAME = 'auth_token'

export interface JWTPayload {
  userId: string
  email: string
  name: string
  role: string
  exp?: number
}

export async function signToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function setAuthCookie(response: Response, token: string): Response {
  const headers = new Headers(response.headers)
  headers.set('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 3600}`)
  return new Response(response.body, { status: response.status, headers })
}
