import { NextResponse } from "next/server";
import { query } from "../../lib/db";
import { getSessionUser } from "../../lib/auth";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json([], { status: 200 }); // Return empty array if not authenticated
    }
    const email = sessionUser.email;

    const res = await query(
      "SELECT id, name, blocks, created_at, updated_at FROM projects WHERE user_email = $1 ORDER BY updated_at DESC",
      [email]
    );

    const projects = res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      blocks: row.blocks,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const email = sessionUser.email;

    const { id, name, blocks } = await req.json();
    if (!id || !name) {
      return NextResponse.json({ error: "Falta id o nombre del proyecto" }, { status: 400 });
    }

    const now = new Date();

    // Check if project exists
    const checkRes = await query("SELECT id FROM projects WHERE id = $1 AND user_email = $2", [id, email]);
    
    let project;
    if (checkRes.rows.length > 0) {
      // Update
      const updateRes = await query(
        `UPDATE projects 
         SET name = $1, blocks = $2, updated_at = $3
         WHERE id = $4 AND user_email = $5
         RETURNING id, name, blocks, created_at, updated_at`,
        [name, JSON.stringify(blocks || []), now, id, email]
      );
      project = updateRes.rows[0];
    } else {
      // Insert
      const insertRes = await query(
        `INSERT INTO projects (id, name, blocks, user_email, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, blocks, created_at, updated_at`,
        [id, name, JSON.stringify(blocks || []), email, now, now]
      );
      project = insertRes.rows[0];
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      blocks: project.blocks,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    });
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    const email = sessionUser.email;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Falta el id del proyecto" }, { status: 400 });
    }

    await query("DELETE FROM projects WHERE id = $1 AND user_email = $2", [id, email]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE project error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
