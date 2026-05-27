import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
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
    if (!user.verification_code || user.verification_code !== cleanCode) {
      return NextResponse.json({ error: "El código ingresado es incorrecto" }, { status: 400 });
    }

    // Check if expired
    if (user.verification_expiry && new Date(user.verification_expiry) < new Date()) {
      return NextResponse.json({ error: "El código ha expirado. Por favor, solicita uno nuevo." }, { status: 400 });
    }

    // Mark as verified
    await query(
      `UPDATE users 
       SET verified = TRUE, verification_code = NULL, verification_expiry = NULL 
       WHERE id = $1`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        unlocked: user.unlocked,
        kit_code: user.kit_code
      }
    });
  } catch (error) {
    console.error("Verify API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
