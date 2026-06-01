import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getSessionUser } from "../../../lib/auth";

// Helper to check if caller is admin
async function isAdmin(): Promise<boolean> {
  const sessionUser = await getSessionUser();
  return sessionUser !== null && sessionUser.role === "admin";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    // Fetch all users sorted by id
    const res = await query(
      "SELECT id, username, email, role, unlocked, kit_code, password FROM users ORDER BY id ASC"
    );

    const users = res.rows.map((u) => {
      const isSecure = u.password.includes(":");
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        unlocked: u.unlocked,
        kitCode: u.kit_code,
        passwordSecurity: isSecure 
          ? "PBKDF2-SHA512 (Encriptado con Salt)" 
          : "Texto Plano (Se requiere actualización)",
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { action, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Falta el ID de usuario" }, { status: 400 });
    }

    switch (action) {
      case "toggle_unlock": {
        const userCheck = await query("SELECT unlocked FROM users WHERE id = $1", [userId]);
        if (userCheck.rows.length === 0) {
          return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }
        const newStatus = !userCheck.rows[0].unlocked;
        await query(
          "UPDATE users SET unlocked = $1, kit_code = $2 WHERE id = $3",
          [newStatus, newStatus ? "MANUAL-ADMIN" : null, userId]
        );
        return NextResponse.json({ success: true, unlocked: newStatus });
      }

      case "change_role": {
        const { role } = body;
        if (role !== "user" && role !== "admin") {
          return NextResponse.json({ error: "Rol no válido" }, { status: 400 });
        }
        await query("UPDATE users SET role = $1 WHERE id = $2", [role, userId]);
        return NextResponse.json({ success: true, role });
      }

      case "delete_user": {
        // Prevent admin from deleting themselves
        const sessionUser = await getSessionUser();
        const adminEmail = sessionUser?.email || "";
        
        const userRes = await query("SELECT email FROM users WHERE id = $1", [userId]);
        if (userRes.rows.length > 0 && userRes.rows[0].email === adminEmail) {
          return NextResponse.json({ error: "No puedes eliminar tu propia cuenta de administrador" }, { status: 400 });
        }

        await query("DELETE FROM users WHERE id = $1", [userId]);
        return NextResponse.json({ success: true, message: "Usuario eliminado con éxito" });
      }

      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin users POST error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
