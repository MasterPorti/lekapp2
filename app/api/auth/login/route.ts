import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { verifyPassword } from "../../../lib/crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const res = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase().trim()]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 });
    }

    const user = res.rows[0];
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    if (!user.verified) {
      let code = user.verification_code;
      let expiry = user.verification_expiry;

      if (!code || !expiry || new Date(expiry) < new Date()) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        expiry = new Date(Date.now() + 15 * 60 * 1000);
        await query(
          "UPDATE users SET verification_code = $1, verification_expiry = $2 WHERE id = $3",
          [code, expiry, user.id]
        );
      }

      const { sendVerificationEmail } = await import("../../../lib/email");
      await sendVerificationEmail(user.email, code);

      return NextResponse.json({
        error: "Tu cuenta de correo no ha sido verificada. Se envió un código de verificación.",
        unverified: true,
        email: user.email
      }, { status: 403 });
    }

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
    console.error("Login API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
