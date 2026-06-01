import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getSessionUser, loginUser } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { code, isFreePlan, freeProjectId } = await req.json();
    const cleanEmail = sessionUser.email;
    const userId = sessionUser.id;

    if (isFreePlan) {
      // Find the project to unlock for free
      let targetProjectId = freeProjectId;
      if (!targetProjectId) {
        // Default to Lek 2 (usually ID 1)
        const defProj = await query("SELECT id FROM learning_projects ORDER BY id ASC LIMIT 1");
        if (defProj.rows.length > 0) {
          targetProjectId = defProj.rows[0].id;
        } else {
          return NextResponse.json({ error: "No hay proyectos configurados en el sistema" }, { status: 500 });
        }
      }

      // Insert free plan access record
      await query(
        `INSERT INTO user_unlocked_projects (user_id, project_id, is_free_plan)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (user_id, project_id) 
         DO UPDATE SET is_free_plan = TRUE`,
        [userId, targetProjectId]
      );

      // Update user general state
      await query(
        "UPDATE users SET unlocked = FALSE, kit_code = 'FREE_PLAN' WHERE id = $1",
        [userId]
      );
      
      // Fetch updated user
      const updatedUser = await query(
        `SELECT id, username, email, role, unlocked, kit_code FROM users WHERE id = $1`,
        [userId]
      );
      
      const newSessionUser = {
        id: updatedUser.rows[0].id,
        username: updatedUser.rows[0].username,
        email: updatedUser.rows[0].email,
        role: updatedUser.rows[0].role as "user" | "admin",
        unlocked: !!updatedUser.rows[0].unlocked,
        kit_code: updatedUser.rows[0].kit_code
      };

      await loginUser(newSessionUser);
      
      return NextResponse.json({
        success: true,
        message: "Plan gratuito activado con éxito",
        user: newSessionUser
      });
    } else {
      // Kit code entered
      if (!code || code.trim() === "") {
        return NextResponse.json({ error: "El código no puede estar vacío" }, { status: 400 });
      }

      // Strip any hyphens or spaces from the user's code input
      const normalizedInput = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();

      // Look up the code in access_codes, normalizing the stored code as well
      const codeCheck = await query(
        "SELECT id, project_id, used_by_email, code FROM access_codes WHERE UPPER(REPLACE(REPLACE(code, '-', ''), ' ', '')) = $1",
        [normalizedInput]
      );

      if (codeCheck.rows.length === 0) {
        return NextResponse.json({ error: "El código de activación no es válido" }, { status: 400 });
      }

      const accessCode = codeCheck.rows[0];
      if (accessCode.used_by_email && accessCode.used_by_email !== cleanEmail) {
        return NextResponse.json({ error: "Este código ya ha sido utilizado por otro usuario" }, { status: 400 });
      }

      // Mark the code as used
      await query(
        "UPDATE access_codes SET used_by_email = $1, used_at = $2 WHERE id = $3",
        [cleanEmail, new Date(), accessCode.id]
      );

      // Unlock the associated project for this user
      await query(
        `INSERT INTO user_unlocked_projects (user_id, project_id, is_free_plan)
         VALUES ($1, $2, FALSE)
         ON CONFLICT (user_id, project_id) 
         DO UPDATE SET is_free_plan = FALSE`,
        [userId, accessCode.project_id]
      );

      // Update user general unlocked state
      await query(
        "UPDATE users SET unlocked = TRUE, kit_code = $1 WHERE id = $2",
        [accessCode.code, userId]
      );

      // Fetch updated user
      const updatedUser = await query(
        `SELECT id, username, email, role, unlocked, kit_code FROM users WHERE id = $1`,
        [userId]
      );

      const newSessionUser = {
        id: updatedUser.rows[0].id,
        username: updatedUser.rows[0].username,
        email: updatedUser.rows[0].email,
        role: updatedUser.rows[0].role as "user" | "admin",
        unlocked: !!updatedUser.rows[0].unlocked,
        kit_code: updatedUser.rows[0].kit_code
      };

      await loginUser(newSessionUser);

      return NextResponse.json({
        success: true,
        message: "Código de kit validado y contenido desbloqueado con éxito",
        user: newSessionUser
      });
    }
  } catch (error) {
    console.error("Unlock API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
