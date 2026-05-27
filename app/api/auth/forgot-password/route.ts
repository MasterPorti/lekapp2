import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { sendPasswordResetEmail } from "../../../lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Falta el correo electrónico" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const userRes = await query("SELECT * FROM users WHERE email = $1", [cleanEmail]);
    
    if (userRes.rows.length === 0) {
      // Return success even if not found to prevent user enumeration
      console.warn(`[FORGOT PASSWORD] Se solicitó restablecimiento para un correo no registrado: ${cleanEmail}`);
      return NextResponse.json({
        success: true,
        message: "Si el correo está registrado, se habrá enviado un código de restablecimiento."
      });
    }

    const user = userRes.rows[0];

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await query(
      `UPDATE users 
       SET reset_code = $1, reset_expiry = $2 
       WHERE id = $3`,
      [resetCode, resetExpiry, user.id]
    );

    // Send email
    await sendPasswordResetEmail(cleanEmail, resetCode);

    return NextResponse.json({
      success: true,
      message: "Si el correo está registrado, se habrá enviado un código de restablecimiento."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
