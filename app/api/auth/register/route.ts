import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { hashPassword } from "../../../lib/crypto";
import { sendVerificationEmail } from "../../../lib/email";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists
    const checkRes = await query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
    if (checkRes.rows.length > 0) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 });
    }

    // Securely hash the password with a random salt
    const hashedPassword = hashPassword(password);

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Insert user as unverified
    const insertRes = await query(
      `INSERT INTO users (username, email, password, role, unlocked, kit_code, verified, verification_code, verification_expiry)
       VALUES ($1, $2, $3, 'user', FALSE, NULL, FALSE, $4, $5)
       RETURNING id, username, email, role, unlocked, kit_code`,
      [username.trim(), cleanEmail, hashedPassword, verificationCode, verificationExpiry]
    );

    const user = insertRes.rows[0];

    // Send verification email
    await sendVerificationEmail(cleanEmail, verificationCode);

    return NextResponse.json({
      success: true,
      email: user.email,
      message: "Código de verificación enviado al correo registrado"
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
