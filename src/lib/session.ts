// Firma y verificación del JWT de sesión. Sin dependencias de Node para que
// también funcione dentro de proxy.ts.
import { SignJWT, jwtVerify } from "jose";
import { DEMO_MODE } from "./demo";

export const SESSION_COOKIE = "ff_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export type SessionPayload = {
  userId: string;
  role: "ADMIN" | "STAFF";
  name: string;
};

// Solo para el modo demo (datos ficticios). Con base real AUTH_SECRET es obligatorio.
const DEMO_SECRET = "fidofelix-demo-mode-secret-not-for-production-use";

function secretKey() {
  const secret = process.env.AUTH_SECRET || (DEMO_MODE ? DEMO_SECRET : undefined);
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET debe existir y tener al menos 32 caracteres");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
