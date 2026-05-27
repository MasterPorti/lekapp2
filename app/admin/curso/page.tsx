"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

interface Video {
  id: string;
  title: string;
  duration: string;
  description: string;
  url: string;
  videoOrder: number;
  isFree?: boolean;
}

interface DetailedCourse {
  id: number;
  projectId: number;
  title: string;
  badge: string;
  description: string;
  videos: Video[];
}

function CourseDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("id");
  const { user, loading: authLoading, logout } = useAuth();

  // State
  const [course, setCourse] = useState<DetailedCourse | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);

  // Forms
  const [courseForm, setCourseForm] = useState({ title: "", badge: "", description: "" });
  const [courseFormError, setCourseFormError] = useState("");
  const [courseFormSuccess, setCourseFormSuccess] = useState("");

  const [videoForm, setVideoForm] = useState({
    id: "",
    title: "",
    duration: "",
    description: "",
    url: "",
    videoOrder: 1,
    isFree: false,
  });
  const [videoFormError, setVideoFormError] = useState("");
  const [videoFormSuccess, setVideoFormSuccess] = useState("");

  // Authenticate Admin client-side
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  // Load course details and videos
  const loadCourseData = async () => {
    if (!courseIdParam) return;
    const cId = parseInt(courseIdParam, 10);
    if (isNaN(cId)) return;

    setCourseLoading(true);
    try {
      const res = await fetch(`/api/courses?id=${cId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        setCourseForm({
          title: data.title,
          badge: data.badge,
          description: data.description || "",
        });
        // Set next order number for new videos
        setVideoForm((prev) => ({
          ...prev,
          id: "",
          title: "",
          duration: "",
          description: "",
          url: "",
          videoOrder: data.videos ? data.videos.length + 1 : 1,
          isFree: false,
        }));
      }
    } catch (err) {
      console.error("Error loading course details:", err);
    } finally {
      setCourseLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin" && courseIdParam) {
      loadCourseData();
    }
  }, [user, courseIdParam]);

  // Course Details Update
  const handleCourseUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseFormError("");
    setCourseFormSuccess("");

    if (!course) return;
    const { title, badge, description } = courseForm;
    if (!title.trim() || !badge.trim()) {
      setCourseFormError("Título e Insignia son obligatorios");
      return;
    }

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_course",
          id: course.id,
          title,
          badge,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar curso");
      }

      setCourseFormSuccess("¡Curso actualizado con éxito!");
      loadCourseData();
    } catch (err: any) {
      setCourseFormError(err.message || "Error al guardar");
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este curso y todos sus videos de forma irreversible?")) return;

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_course",
          id: course.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar curso");
      }

      router.push(`/admin/lek?id=${course.projectId}`);
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    }
  };

  // Video CRUD
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoFormError("");
    setVideoFormSuccess("");

    if (!course) return;

    const { id, title, duration, description, url, videoOrder, isFree } = videoForm;
    if (!title.trim() || !duration.trim() || !url.trim()) {
      setVideoFormError("Título, Duración y URL del video son obligatorios");
      return;
    }

    const action = id ? "update_video" : "add_video";

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          id: id || undefined,
          courseId: course.id,
          title,
          duration,
          description,
          url,
          videoOrder: parseInt(videoOrder as any, 10) || 0,
          isFree,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al procesar video");
      }

      setVideoFormSuccess(id ? "¡Video actualizado con éxito!" : "¡Video añadido con éxito!");
      loadCourseData();
    } catch (err: any) {
      setVideoFormError(err.message || "Error al guardar video");
    }
  };

  const handleEditVideo = (video: Video) => {
    setVideoForm({
      id: video.id,
      title: video.title,
      duration: video.duration,
      description: video.description || "",
      url: video.url,
      videoOrder: video.videoOrder,
      isFree: !!video.isFree,
    });
    setVideoFormError("");
    setVideoFormSuccess("");
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este video?")) return;

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_video",
          id: videoId,
        }),
      });

      if (res.ok) {
        loadCourseData();
      }
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  // Render Loader if auth checking or course loading is in progress
  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f3f4de]">
        <div className="text-sm font-mono font-bold text-gray-700">Verificando credenciales de administrador...</div>
      </div>
    );
  }

  if (courseLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f3f4de]">
        <div className="text-sm font-mono font-bold text-gray-700">Cargando playlist del curso...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-[#f3f4de] p-6 text-center">
        <h3 className="text-sm font-bold font-display uppercase tracking-wider text-gray-500">Curso no encontrado</h3>
        <button
          onClick={() => router.push("/admin")}
          className="mt-4 bg-gray-900 text-white font-bold uppercase text-xs px-4 py-2 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
        >
          Volver al panel
        </button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-dvh flex flex-col bg-[#f3f4de] text-gray-900 font-sans pb-12"
      style={{
        backgroundImage: 'radial-gradient(rgba(220, 42, 55, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* HEADER */}
      <header className="w-full bg-zinc-950 text-white border-b-2 border-gray-900 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/admin/lek?id=${course.projectId}`)}
              className="mr-2 flex items-center justify-center w-8 h-8 bg-zinc-800 border border-zinc-700 hover:border-[#dc2a36] text-gray-300 hover:text-white rounded-none transition-all active:scale-95 cursor-pointer"
              title="Volver al proyecto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="bg-[#dc2a36] text-white px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-white">
              CURSO
            </span>
            <h1 className="text-base sm:text-lg font-bold font-display uppercase tracking-widest leading-none truncate max-w-[200px] sm:max-w-sm">
              Playlist: {course.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="text-xs font-bold text-gray-300 hover:text-white hover:underline cursor-pointer bg-transparent border-none"
            >
              Volver al Home
            </button>
            <button
              onClick={logout}
              className="bg-[#dc2a36] hover:bg-[#c02030] px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer border border-white rounded-none shadow-[2px_2px_0px_white]"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* HUB CONTENT */}
      <main className="max-w-7xl w-full mx-auto px-6 mt-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-[fadeIn_0.2s_ease-out]">
        
        {/* LEFT COLUMN: COURSE INFO & UPDATE FORM (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Edit Course Form Box */}
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none">
            <h3 className="text-sm font-bold font-display uppercase tracking-wide border-b-2 border-gray-900 pb-2 mb-4">
              Detalles del Curso
            </h3>

            {courseFormError && (
              <div className="bg-[#dc2a36]/10 border-2 border-[#dc2a36] text-[#dc2a36] px-3 py-1.5 text-xs font-mono font-bold mb-4">
                {courseFormError}
              </div>
            )}
            {courseFormSuccess && (
              <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 px-3 py-1.5 text-xs font-mono font-bold mb-4">
                {courseFormSuccess}
              </div>
            )}

            <form onSubmit={handleCourseUpdate} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Título del Curso</label>
                <input
                  type="text"
                  placeholder="Ej. Arma tu Lek 2"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs font-sans font-bold focus:outline-none focus:bg-white rounded-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Insignia (Badge)</label>
                <input
                  type="text"
                  placeholder="Ej. Curso 1"
                  value={courseForm.badge}
                  onChange={(e) => setCourseForm({ ...courseForm, badge: e.target.value })}
                  className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs font-sans font-bold focus:outline-none focus:bg-white rounded-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Descripción</label>
                <textarea
                  placeholder="Detalles sobre las clases..."
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:bg-white rounded-none resize-none"
                />
              </div>
              <div className="flex gap-2.5 mt-1 pt-2 border-t border-dashed border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-bold uppercase tracking-wider text-xs py-2 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] cursor-pointer rounded-none"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCourse}
                  className="bg-white hover:bg-gray-100 text-[#dc2a36] font-bold uppercase tracking-wider text-xs px-3 py-2 border-2 border-gray-900 rounded-none cursor-pointer"
                  title="Eliminar Curso"
                >
                  Eliminar
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* RIGHT COLUMN: PLAYLIST & VIDEO MANAGER (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none flex-1 flex flex-col md:flex-row gap-6">
            
            {/* Left inside: Video Form (5 cols equivalent) */}
            <div className="flex-1 flex flex-col border-r-0 md:border-r md:border-gray-200 md:pr-6">
              <h3 className="text-sm font-bold font-display uppercase tracking-wide border-b-2 border-gray-900 pb-2 mb-4">
                {videoForm.id ? "Editar Video" : "Añadir Video"}
              </h3>

              {videoFormError && (
                <div className="bg-[#dc2a36]/10 border-2 border-[#dc2a36] text-[#dc2a36] px-3 py-2 text-xs font-mono font-bold mb-4">
                  {videoFormError}
                </div>
              )}
              {videoFormSuccess && (
                <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 px-3 py-2 text-xs font-mono font-bold mb-4">
                  {videoFormSuccess}
                </div>
              )}

              <form onSubmit={handleVideoSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Título de la Lección</label>
                  <input
                    type="text"
                    placeholder="Ej. Unboxing de Componentes"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs font-sans font-bold focus:outline-none focus:bg-white rounded-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Duración (MM:SS)</label>
                    <input
                      type="text"
                      placeholder="Ej. 5:40"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                      className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs font-mono font-bold focus:outline-none focus:bg-white rounded-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Orden</label>
                    <input
                      type="number"
                      value={videoForm.videoOrder}
                      onChange={(e) => setVideoForm({ ...videoForm, videoOrder: parseInt(e.target.value, 10) || 1 })}
                      className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs font-mono font-bold focus:outline-none focus:bg-white rounded-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">URL del Video (MP4/Stream)</label>
                  <input
                    type="text"
                    placeholder="Ej. https://storage.com/video.mp4"
                    value={videoForm.url}
                    onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
                    className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs font-mono focus:outline-none focus:bg-white rounded-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Descripción</label>
                  <textarea
                    placeholder="Detalles de la clase..."
                    rows={2}
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:bg-white rounded-none resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <input
                    key={videoForm.id || "new"}
                    type="checkbox"
                    id="videoIsFree"
                    checked={videoForm.isFree}
                    onChange={(e) => setVideoForm({ ...videoForm, isFree: e.target.checked })}
                    className="w-4 h-4 border-2 border-gray-900 accent-[#dc2a36] rounded-none cursor-pointer"
                  />
                  <label htmlFor="videoIsFree" className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-700 cursor-pointer select-none">
                    Disponible en Plan Gratis
                  </label>
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-[#dc2a36] hover:bg-[#c02030] text-white font-bold uppercase tracking-wider text-xs py-2 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none"
                  >
                    {videoForm.id ? "Guardar Video" : "Añadir Video"}
                  </button>
                  {videoForm.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setVideoForm({
                          id: "",
                          title: "",
                          duration: "",
                          description: "",
                          url: "",
                          videoOrder: course.videos ? course.videos.length + 1 : 1,
                          isFree: false,
                        })
                      }
                      className="bg-white hover:bg-gray-100 text-gray-900 font-bold uppercase tracking-wider text-xs px-3 py-2 border-2 border-gray-900 rounded-none cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right inside: Videos Playlist List (7 cols equivalent) */}
            <div className="flex-1 flex flex-col min-h-[300px]">
              <h3 className="text-sm font-bold font-display uppercase tracking-wide border-b-2 border-gray-900 pb-2 mb-4 flex justify-between items-center text-gray-500">
                <span>Playlist del Curso</span>
                <span>{course.videos?.length || 0} VIDEOS</span>
              </h3>
              {!course.videos || course.videos.length === 0 ? (
                <div className="text-xs font-mono text-gray-400 py-12 text-center flex-1 flex items-center justify-center">
                  Este curso aún no tiene videos. ¡Agrega el primero!
                </div>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[420px] pr-1">
                  {course.videos.map((video) => (
                    <div
                      key={video.id}
                      className="p-2 bg-gray-50 border border-gray-300 flex justify-between items-center gap-3 rounded-none text-xs"
                    >
                      <div className="min-w-0 flex gap-2 items-center">
                        <span className="w-5 h-5 bg-gray-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                          {video.videoOrder}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate leading-tight flex items-center gap-1.5">
                            {video.title}
                            {video.isFree && (
                              <span className="bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold px-1 py-0.2 shrink-0">
                                GRATIS
                              </span>
                            )}
                          </h4>
                          <span className="text-[9px] font-mono text-gray-400 block mt-0.5">{video.duration} Mins</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleEditVideo(video)}
                          className="w-6 h-6 border border-gray-400 hover:border-gray-900 bg-white flex items-center justify-center cursor-pointer active:scale-90"
                          title="Editar Video"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="w-6 h-6 border border-gray-400 hover:border-[#dc2a36] bg-white flex items-center justify-center cursor-pointer active:scale-90"
                          title="Eliminar Video"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-700 hover:text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

export default function AdminCoursePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3f4de] flex items-center justify-center font-mono text-xs text-gray-500">
        Cargando playlist del curso...
      </div>
    }>
      <CourseDetailContent />
    </Suspense>
  );
}
