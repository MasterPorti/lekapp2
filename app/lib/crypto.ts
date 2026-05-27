import crypto from "crypto";

/**
 * Hash a password using PBKDF2 and a random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash
 * Falls back to plain text comparison if the stored value doesn't contain a salt separator
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  if (!storedValue.includes(":")) {
    // Backwards compatibility with existing accounts / unhashed seed passwords
    return password === storedValue;
  }
  const [salt, originalHash] = storedValue.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}
