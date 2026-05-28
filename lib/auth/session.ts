import { jwtVerify, SignJWT } from 'jose';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const AUTH_COOKIE_NAME = 'auth-token';
const SESSION_TTL_SECONDS = 60 * 60 * 24;

type RoleName = 'STUDENT' | 'CASHIER' | 'LIBRARIAN' | 'ADMIN';

type SessionClaims = {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;

  role: RoleName;   // 🔥 CAMBIO CLAVE

  permissions: string[];
  db?: string;
};

function getAuthSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'dev-auth-secret-change-me';

  return new TextEncoder().encode(secret);
}

function normalizeClaims(
  payload: Record<string, unknown>
): SessionClaims | null {
  const id = Number(payload.id ?? 0);
  const email = String(payload.email ?? '');
  const username = String(payload.username ?? '');

  const role = String(payload.role ?? '').toUpperCase() as RoleName;

  const permissions = Array.isArray(payload.permissions)
    ? payload.permissions.map((p) => String(p || '').trim()).filter(Boolean)
    : [];

  if (!id || !email || !username || !role) {
    return null;
  }

  return {
    id,
    email,
    username,
    firstName: String(payload.firstName ?? ''),
    lastName: String(payload.lastName ?? ''),
    role, // 🔥 ahora es string
    permissions,
    db: payload.db ? String(payload.db) : undefined,
  };
}

export async function createSessionToken(claims: SessionClaims) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return normalizeClaims(payload);
  } catch {
    return null;
  }
}

export async function readSessionFromRequest(
  request: NextRequest
): Promise<SessionClaims | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
}