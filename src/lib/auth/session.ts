import { cookies } from "next/headers";

const COOKIE_NAME = process.env.COOKIE_NAME || "auth_token";

export async function setAuthCookie(token: string) {
  // Await the cookies() helper
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day in seconds
  });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}