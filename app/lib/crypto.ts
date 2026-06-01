import crypto from "crypto";

// Fallback session secret if not defined in .env
// We generate a secure random secret on startup to guarantee security out-of-the-box,
// but print a warning so the user knows they should configure one in production to persist sessions.
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.SESSION_SECRET) {
  console.warn(
    "WARNING: SESSION_SECRET env variable is not set. A random secret has been generated. " +
    "User sessions will be invalidated if the server restarts."
  );
}

/**
 * Hash a password using PBKDF2 and a random salt
 * Default iterations is 310,000 to meet OWASP guidelines for SHA512.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 310000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  // Store as salt:iterations:hash for clear versioning / parameters
  return `${salt}:${iterations}:${hash}`;
}

/**
 * Verify a password against a stored hash
 * Supports:
 * 1. Plain text (fallback)
 * 2. Legacy hash (salt:hash - 1000 iterations)
 * 3. Modern hash (salt:iterations:hash)
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  if (!storedValue.includes(":")) {
    // Backwards compatibility with existing accounts / unhashed seed passwords
    return password === storedValue;
  }
  
  const parts = storedValue.split(":");
  if (parts.length === 2) {
    // Legacy hash: salt:hash (1000 iterations)
    const [salt, originalHash] = parts;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    // Constant time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(hash);
    const expectedBuffer = Buffer.from(originalHash);
    return sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } else if (parts.length === 3) {
    // Modern hash: salt:iterations:hash
    const [salt, iterationsStr, originalHash] = parts;
    const iterations = parseInt(iterationsStr, 10);
    if (isNaN(iterations)) return false;
    const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
    
    // Constant time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(hash);
    const expectedBuffer = Buffer.from(originalHash);
    return sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  }
  
  return false;
}

/**
 * Generate a signed session token
 */
export function signToken(payload: object, expiresMin = 60 * 24 * 7): string {
  const expiry = Date.now() + expiresMin * 60 * 1000;
  const tokenPayload = { ...payload, exp: expiry };
  const data = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verify a signed session token
 */
export function verifyToken(token: string): any {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(data)
      .digest("base64url");

    // Timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Token has expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}

