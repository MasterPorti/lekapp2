import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getSessionUser } from "../../../lib/auth";

// Helper to check if caller is admin
async function isAdmin(): Promise<boolean> {
  const sessionUser = await getSessionUser();
  return sessionUser !== null && sessionUser.role === "admin";
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
      case "create_course": {
        const { title, badge, description, projectId } = body;
        if (!title || !badge || !projectId) {
          return NextResponse.json({ error: "Falta título, insignia o proyecto del curso" }, { status: 400 });
        }
        const insertRes = await query(
          "INSERT INTO courses (title, badge, description, project_id) VALUES ($1, $2, $3, $4) RETURNING *",
          [title.trim(), badge.trim(), description ? description.trim() : "", projectId]
        );
        return NextResponse.json({ success: true, course: insertRes.rows[0] });
      }

      case "update_course": {
        const { id, title, badge, description } = body;
        if (!id || !title || !badge) {
          return NextResponse.json({ error: "Faltan datos obligatorios para actualizar el curso" }, { status: 400 });
        }
        const updateRes = await query(
          "UPDATE courses SET title = $1, badge = $2, description = $3 WHERE id = $4 RETURNING *",
          [title.trim(), badge.trim(), description ? description.trim() : "", id]
        );
        if (updateRes.rows.length === 0) {
          return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
        }
        return NextResponse.json({ success: true, course: updateRes.rows[0] });
      }

      case "delete_course": {
        const { id } = body;
        if (!id) {
          return NextResponse.json({ error: "Falta el ID del curso" }, { status: 400 });
        }
        await query("DELETE FROM courses WHERE id = $1", [id]);
        return NextResponse.json({ success: true, message: "Curso eliminado con éxito" });
      }

      case "add_video": {
        const { courseId, title, duration, description, url, videoOrder, isFree } = body;
        if (!courseId || !title || !duration || !url) {
          return NextResponse.json({ error: "Faltan datos obligatorios para el video" }, { status: 400 });
        }
        const videoId = `v_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const insertRes = await query(
          `INSERT INTO videos (id, course_id, title, duration, description, url, video_order, is_free)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [videoId, courseId, title.trim(), duration.trim(), description ? description.trim() : "", url.trim(), videoOrder || 0, isFree === true]
        );
        return NextResponse.json({ success: true, video: insertRes.rows[0] });
      }

      case "update_video": {
        const { id, title, duration, description, url, videoOrder, isFree } = body;
        if (!id || !title || !duration || !url) {
          return NextResponse.json({ error: "Faltan datos obligatorios para el video" }, { status: 400 });
        }
        const updateRes = await query(
          `UPDATE videos 
           SET title = $1, duration = $2, description = $3, url = $4, video_order = $5, is_free = $6
           WHERE id = $7
           RETURNING *`,
          [title.trim(), duration.trim(), description ? description.trim() : "", url.trim(), videoOrder || 0, isFree === true, id]
        );
        if (updateRes.rows.length === 0) {
          return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
        }
        return NextResponse.json({ success: true, video: updateRes.rows[0] });
      }

      case "delete_video": {
        const { id } = body;
        if (!id) {
          return NextResponse.json({ error: "Falta el ID del video" }, { status: 400 });
        }
        await query("DELETE FROM videos WHERE id = $1", [id]);
        return NextResponse.json({ success: true, message: "Video eliminado con éxito" });
      }

      default:
        return NextResponse.json({ error: `Acción '${action}' no reconocida` }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin courses API error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
