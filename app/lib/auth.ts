import { cookies } from "next/headers";
import { signToken, verifyToken } from "./crypto";

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  unlocked: boolean;
  kit_code: string | null;
}

/**
 * Creates a secure session token and sets it as an HTTP-only cookie
 */
export async function loginUser(user: Omit<SessionUser, "kit_code" | "unlocked"> & { kit_code: string | null; unlocked: boolean }) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    unlocked: user.unlocked,
    kit_code: user.kit_code,
  };
  
  // 7 days expiration
  const token = signToken(payload, 60 * 24 * 7);
  
  const cookieStore = await cookies();
  cookieStore.set("lek_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
  });
}

/**
 * Clears the secure session cookie
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.set("lek_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
}

/**
 * Gets the verified user session payload from the HTTP-only cookie
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lek_session")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    console.error("Error retrieving session user:", error);
    return null;
  }
}

/**
 * Verifies a Cloudflare Turnstile CAPTCHA token.
 * In non-production environments (development/localhost), this always succeeds without querying Cloudflare.
 */
export async function verifyTurnstileToken(token?: string, remoteIp?: string): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    // In development environment, bypass CAPTCHA check
    return true;
  }

  if (!token) {
    return false;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not defined in environment variables.");
    return false;
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error during Turnstile verification:", error);
    return false;
  }
}
