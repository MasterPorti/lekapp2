import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { sendVerificationEmail } from "../../../lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Falta el correo electrónico" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const userRes = await query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const user = userRes.rows[0];

    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await query(
      `UPDATE users 
       SET verification_code = $1, verification_expiry = $2 
       WHERE id = $3`,
      [code, expiry, user.id]
    );

    // Send email
    await sendVerificationEmail(cleanEmail, code);

    return NextResponse.json({
      success: true,
      message: "Código de verificación reenviado con éxito"
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
