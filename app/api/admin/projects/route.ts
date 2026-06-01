import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getSessionUser } from "../../../lib/auth";

// Helper to check if caller is admin
async function isAdmin(): Promise<boolean> {
  const sessionUser = await getSessionUser();
  return sessionUser !== null && sessionUser.role === "admin";
}

export async function GET(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "get_codes") {
      const projectIdParam = searchParams.get("projectId");
      if (!projectIdParam) {
        return NextResponse.json({ error: "Falta el projectId" }, { status: 400 });
      }
      const projectId = parseInt(projectIdParam, 10);
      const codesRes = await query(
        "SELECT * FROM access_codes WHERE project_id = $1 ORDER BY id DESC",
        [projectId]
      );
      return NextResponse.json(codesRes.rows);
    }

    if (action === "get_all_codes") {
      const codesRes = await query(
        `SELECT ac.*, lp.name as project_name 
         FROM access_codes ac
         LEFT JOIN learning_projects lp ON ac.project_id = lp.id
         ORDER BY ac.id DESC`
      );
      return NextResponse.json(codesRes.rows);
    }

    // Default: Get all learning projects
    const projectsRes = await query("SELECT * FROM learning_projects ORDER BY id ASC");
    
    // For each project, count courses
    const projects = [];
    for (const proj of projectsRes.rows) {
      const countRes = await query("SELECT COUNT(*) FROM courses WHERE project_id = $1", [proj.id]);
      const codesCountRes = await query("SELECT COUNT(*) FROM access_codes WHERE project_id = $1", [proj.id]);
      projects.push({
        ...proj,
        coursesCount: parseInt(countRes.rows[0].count, 10),
        codesCount: parseInt(codesCountRes.rows[0].count, 10),
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Admin projects GET error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Falta el campo 'action'" }, { status: 400 });
    }

    switch (action) {
      case "create_project": {
        const { name, description } = body;
        if (!name || !name.trim()) {
          return NextResponse.json({ error: "El nombre del proyecto es obligatorio" }, { status: 400 });
        }
        const insertRes = await query(
          "INSERT INTO learning_projects (name, description) VALUES ($1, $2) RETURNING *",
          [name.trim(), description ? description.trim() : ""]
        );
        return NextResponse.json({ success: true, project: insertRes.rows[0] });
      }

      case "delete_project": {
        const { id } = body;
        if (!id) {
          return NextResponse.json({ error: "Falta el ID del proyecto" }, { status: 400 });
        }
        await query("DELETE FROM learning_projects WHERE id = $1", [id]);
        return NextResponse.json({ success: true, message: "Proyecto eliminado con éxito" });
      }

      case "generate_code": {
        const { projectId, customCode } = body;
        if (!projectId) {
          return NextResponse.json({ error: "Falta el ID del proyecto" }, { status: 400 });
        }

        let code = customCode ? customCode.trim().toUpperCase() : "";
        if (!code) {
          // Generate a random unique code: LEK-XXXX-XXX
          const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
          const part2 = Math.random().toString(36).substring(2, 5).toUpperCase();
          code = `LEK-${part1}-${part2}`;
        }

        // Check if code already exists
        const check = await query("SELECT id FROM access_codes WHERE code = $1", [code]);
        if (check.rows.length > 0) {
          return NextResponse.json({ error: "Este código ya existe" }, { status: 400 });
        }

        const insertRes = await query(
          "INSERT INTO access_codes (code, project_id) VALUES ($1, $2) RETURNING *",
          [code, projectId]
        );
        return NextResponse.json({ success: true, code: insertRes.rows[0] });
      }

      case "delete_code": {
        const { id } = body;
        if (!id) {
          return NextResponse.json({ error: "Falta el ID del código" }, { status: 400 });
        }
        await query("DELETE FROM access_codes WHERE id = $1", [id]);
        return NextResponse.json({ success: true, message: "Código eliminado con éxito" });
      }

      default:
        return NextResponse.json({ error: `Acción '${action}' no reconocida` }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin projects POST error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
