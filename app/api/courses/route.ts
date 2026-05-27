import { NextResponse } from "next/server";
import { query } from "../../lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (idParam) {
      const courseId = parseInt(idParam, 10);
      if (isNaN(courseId)) {
        return NextResponse.json({ error: "ID de curso inválido" }, { status: 400 });
      }

      // Fetch course details
      const courseRes = await query("SELECT * FROM courses WHERE id = $1", [courseId]);
      if (courseRes.rows.length === 0) {
        return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
      }

      const course = courseRes.rows[0];

      // Fetch videos for this course
      const videosRes = await query(
        "SELECT * FROM videos WHERE course_id = $1 ORDER BY video_order ASC, id ASC",
        [courseId]
      );

      return NextResponse.json({
        id: course.id,
        projectId: course.project_id,
        title: course.title,
        badge: course.badge,
        description: course.description,
        videos: videosRes.rows.map((v) => ({
          id: v.id,
          title: v.title,
          duration: v.duration,
          description: v.description,
          url: v.url,
          videoOrder: v.video_order,
          isFree: v.is_free
        }))
      });
    } else {
      const projectIdParam = searchParams.get("projectId");
      let coursesRes;
      
      if (projectIdParam) {
        const projectId = parseInt(projectIdParam, 10);
        if (isNaN(projectId)) {
          return NextResponse.json({ error: "ID de proyecto inválido" }, { status: 400 });
        }
        coursesRes = await query("SELECT * FROM courses WHERE project_id = $1 ORDER BY id ASC", [projectId]);
      } else {
        coursesRes = await query("SELECT * FROM courses ORDER BY id ASC");
      }
      
      // For each course, count videos
      const courses = [];
      for (const course of coursesRes.rows) {
        const countRes = await query("SELECT COUNT(*) FROM videos WHERE course_id = $1", [course.id]);
        courses.push({
          id: course.id,
          projectId: course.project_id,
          title: course.title,
          badge: course.badge,
          description: course.description,
          videosCount: parseInt(countRes.rows[0].count, 10)
        });
      }

      return NextResponse.json(courses);
    }
  } catch (error) {
    console.error("GET courses error:", error);
    return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 });
  }
}
