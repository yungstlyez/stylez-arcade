import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE = "stylez-author";
const STATE_COOKIE = "stylez-google";
const SESSION_MS = 14 * 24 * 60 * 60 * 1000;

function secret() {
  const value = process.env.ADMIN_SESSION_SECRET ?? "";
  if (value.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is missing or too short");
  }
  return value;
}

export function adminMailbox() {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export function adminArmed() {
  return Boolean(
    adminMailbox() &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.ADMIN_SESSION_SECRET,
  );
}

function hmac(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}

export function originFrom(request: Request) {
  return new URL(request.url).origin;
}

export function googleCallbackUrl(origin: string) {
  return `${origin}/api/admin/google/callback`;
}

export function googleAuthorizeUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: googleCallbackUrl(origin),
    response_type: "code",
    scope: "openid email",
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function mintGoogleState() {
  return randomBytes(24).toString("hex");
}

export function attachGoogleState(response: NextResponse, state: string) {
  response.cookies.set(STATE_COOKIE, state, { ...cookieBase(), maxAge: 600 });
}

export async function googleStateMatches(incoming: string) {
  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value ?? "";
  if (!incoming || !expected) return false;
  return safeEqual(incoming, expected);
}

export async function exchangeGoogleCode(origin: string, code: string) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: googleCallbackUrl(origin),
    grant_type: "authorization_code",
  });
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenResponse.ok) return null;
  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) return null;
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileResponse.ok) return null;
  const profile = (await profileResponse.json()) as { email?: string; email_verified?: boolean };
  const email = profile.email?.trim().toLowerCase() ?? "";
  if (!email || profile.email_verified === false) return null;
  return email;
}

export function attachAuthorSession(response: NextResponse) {
  const sessionExp = Date.now() + SESSION_MS;
  response.cookies.set(SESSION_COOKIE, `${sessionExp}.${hmac(`author:${sessionExp}`)}`, {
    ...cookieBase(),
    maxAge: Math.floor(SESSION_MS / 1000),
  });
  response.cookies.delete(STATE_COOKIE);
}

export async function isAuthorSession() {
  try {
    const store = await cookies();
    const packed = store.get(SESSION_COOKIE)?.value;
    if (!packed) return false;
    const [expRaw, expected] = packed.split(".");
    const exp = Number(expRaw);
    if (!exp || !expected || Date.now() > exp) return false;
    return safeEqual(hmac(`author:${exp}`), expected);
  } catch {
    return false;
  }
}

export async function clearAuthorSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(STATE_COOKIE);
}
