import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { hashPassword } from "../../../lib/crypto";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.trim();

    const userRes = await query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const user = userRes.rows[0];

    // Check if code matches
    if (!user.reset_code || user.reset_code !== cleanCode) {
      return NextResponse.json({ error: "El código ingresado es incorrecto" }, { status: 400 });
    }

    // Check if expired
    if (user.reset_expiry && new Date(user.reset_expiry) < new Date()) {
      return NextResponse.json({ error: "El código ha expirado. Por favor, solicita uno nuevo." }, { status: 400 });
    }

    // Securely hash the new password
    const hashedPassword = hashPassword(newPassword);

    // Update password and clear reset fields
    await query(
      `UPDATE users 
       SET password = $1, reset_code = NULL, reset_expiry = NULL 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    return NextResponse.json({
      success: true,
      message: "Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
