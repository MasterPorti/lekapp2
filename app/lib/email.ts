/**
 * Email service helper using Resend.com
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendEmail({
  to,
  subject,
  html,
  codeForLog
}: {
  to: string;
  subject: string;
  html: string;
  codeForLog?: string;
}): Promise<boolean> {
  const apiKey = (process.env.RESENTAPI_KEY || process.env.RESEND_API_KEY || "").trim();
  const fromEmail = (process.env.RESEND_FROM || "no-replay@lekbot.com").trim();

  // If no API Key is provided, print code to console as fallback for development
  if (!apiKey) {
    console.warn("\n========================================================");
    console.warn(`⚠️ [RESEND WARNING] No se detectó RESENTAPI_KEY o RESEND_API_KEY en .env.`);
    console.warn(`Simulando envío de correo a: ${to}`);
    console.warn(`Asunto: ${subject}`);
    if (codeForLog) {
      console.warn(`CÓDIGO GENERADO: ${codeForLog}`);
    }
    console.warn("========================================================\n");
    return true;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Error desconocido al llamar a Resend");
    }

    console.log(`Email enviado con éxito a ${to} (ID: ${data.id})`);
    return true;
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Falló el envío de correo a ${to}.`);
    if (codeForLog) {
      console.warn("\n========================================================");
      console.warn(`[DESARROLLO - CODIGO FALLBACK]`);
      console.warn(`Destinatario: ${to}`);
      console.warn(`CÓDIGO GENERADO: ${codeForLog}`);
      console.warn("========================================================\n");
    }
    return false;
  }
}

/**
 * Sends a 6-digit verification code to a newly registered user
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const subject = "Verifica tu cuenta - Lek Learning";
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #111827; background-color: #f9fafb; max-width: 600px; margin: 0 auto; border: 4px solid #111827;">
      <h2 style="font-size: 20px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 20px;">
        🏫 LEK LEARNING - VERIFICACIÓN
      </h2>
      <p style="font-size: 14px; line-height: 1.5;">
        ¡Hola! Gracias por registrarte en nuestra plataforma de robótica y aprendizaje.
      </p>
      <p style="font-size: 14px; line-height: 1.5;">
        Para completar la creación de tu cuenta y empezar a aprender, por favor ingresa el siguiente código de verificación de 6 dígitos en la aplicación:
      </p>
      <div style="background-color: #f3f4f6; border: 2px solid #111827; padding: 15px; text-align: center; margin: 25px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2a36;">
          ${code}
        </span>
      </div>
      <p style="font-size: 12px; color: #4b5563; margin-top: 30px;">
        Este código es válido por 15 minutos. Si no solicitaste esta cuenta, puedes ignorar este mensaje de forma segura.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, codeForLog: code });
}

/**
 * Sends a 6-digit password reset code to a user
 */
export async function sendPasswordResetEmail(email: string, code: string): Promise<boolean> {
  const subject = "Restablecer tu contraseña - Lek Learning";
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #111827; background-color: #f9fafb; max-width: 600px; margin: 0 auto; border: 4px solid #111827;">
      <h2 style="font-size: 20px; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 20px;">
        🔑 LEK LEARNING - RESTABLECER CONTRASEÑA
      </h2>
      <p style="font-size: 14px; line-height: 1.5;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta asociada a este correo.
      </p>
      <p style="font-size: 14px; line-height: 1.5;">
        Usa el siguiente código de 6 dígitos para autorizar el cambio de tu contraseña en la página de recuperación:
      </p>
      <div style="background-color: #f3f4f6; border: 2px solid #111827; padding: 15px; text-align: center; margin: 25px 0;">
        <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2a36;">
          ${code}
        </span>
      </div>
      <p style="font-size: 12px; color: #4b5563; margin-top: 30px;">
        Este código de seguridad expirará en 15 minutos. Si tú no solicitaste este restablecimiento, por favor ignora este correo. Tu contraseña actual seguirá siendo segura.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html, codeForLog: code });
}
