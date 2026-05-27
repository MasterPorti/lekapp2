"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

interface LearningProject {
  id: number;
  name: string;
  description: string;
  coursesCount: number;
  codesCount: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  
  // Data lists state
  const [projects, setProjects] = useState<LearningProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Project Form State
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [projectFormError, setProjectFormError] = useState("");
  const [projectFormSuccess, setProjectFormSuccess] = useState("");
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

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

  // Load projects list
  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadProjects();
    }
  }, [user]);

  // Project CRUD
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectFormError("");
    setProjectFormSuccess("");

    if (!projectForm.name.trim()) {
      setProjectFormError("El nombre del proyecto es obligatorio");
      return;
    }

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_project",
          name: projectForm.name,
          description: projectForm.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear proyecto");
      }

      setProjectFormSuccess("¡Proyecto creado con éxito!");
      setProjectForm({ name: "", description: "" });
      setShowNewProjectForm(false);
      loadProjects();
    } catch (err: any) {
      setProjectFormError(err.message || "Error al procesar petición");
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proyecto? Se borrarán todos sus cursos, videos y códigos asociados de forma irreversible.")) return;

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_project",
          id: projectId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al eliminar proyecto");
      }

      loadProjects();
    } catch (err: any) {
      alert(err.message || "Error al eliminar");
    }
  };

  // Render Loader if auth checking is in progress or user is not admin
  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f3f4de]">
        <div className="text-sm font-mono font-bold text-gray-700">Verificando credenciales de administrador...</div>
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
            <span className="bg-[#dc2a36] text-white px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-white">
              ADMIN
            </span>
            <h1 className="text-base sm:text-lg font-bold font-display uppercase tracking-widest leading-none">
              Panel de Control LEK
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

      {/* NAVIGATION / SUBHEADER */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-6">
        <div className="flex flex-col sm:flex-row border-4 border-gray-900 bg-white p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none gap-2 justify-between items-center">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">Panel Principal</span>
          </div>
          <button
            onClick={() => router.push("/admin/users")}
            className="w-full sm:w-auto px-6 py-2 text-xs sm:text-sm font-bold font-display uppercase tracking-widest cursor-pointer border-2 border-gray-900 bg-white hover:bg-gray-100 text-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-none flex items-center justify-center gap-2"
          >
            <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Gestión de Usuarios</span>
          </button>
        </div>
      </div>

      {/* MAIN HUB */}
      <main className="max-w-7xl w-full mx-auto px-6 mt-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMN 1: CREATE PROJECT (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          {/* Create Project Form */}
          {showNewProjectForm ? (
            <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none animate-[fadeIn_0.15s_ease-out]">
              <div className="flex justify-between items-center border-b-2 border-gray-900 pb-2 mb-4">
                <h3 className="text-sm font-bold font-display uppercase tracking-wide">
                  Nuevo Proyecto / Ruta
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewProjectForm(false)}
                  className="text-xs font-mono font-bold text-[#dc2a36] hover:underline cursor-pointer bg-transparent border-none"
                >
                  [Cerrar]
                </button>
              </div>
              {projectFormError && (
                <div className="bg-[#dc2a36]/10 border-2 border-[#dc2a36] text-[#dc2a36] px-3 py-2 text-xs font-mono font-bold mb-4">
                  {projectFormError}
                </div>
              )}
              {projectFormSuccess && (
                <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-700 px-3 py-2 text-xs font-mono font-bold mb-4">
                  {projectFormSuccess}
                </div>
              )}
              <form onSubmit={handleProjectSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Nombre del Proyecto</label>
                  <input
                    type="text"
                    placeholder="Ej. Lek 3"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs font-bold focus:outline-none focus:bg-white rounded-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-600">Descripción</label>
                  <textarea
                    placeholder="Descripción de este kit o ruta..."
                    rows={2}
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full bg-[#f3f4de]/35 border-2 border-gray-900 px-2 py-1.5 text-xs focus:outline-none focus:bg-white rounded-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold uppercase tracking-wider text-xs py-2 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-none"
                >
                  Crear Proyecto
                </button>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewProjectForm(true)}
              className="w-full bg-white hover:bg-[#f3f4de]/40 text-gray-900 font-bold uppercase tracking-wider text-xs py-3 border-4 border-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-center rounded-none font-display"
            >
              + Crear Nuevo Proyecto / Ruta
            </button>
          )}
        </section>

        {/* COLUMN 2: PROJECTS LIST (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-sm font-bold font-display uppercase tracking-wide border-b-2 border-gray-900 pb-2 mb-4">
              Proyectos Disponibles
            </h3>
            {projectsLoading ? (
              <div className="text-xs font-mono text-gray-500 py-8 text-center">Cargando proyectos...</div>
            ) : projects.length === 0 ? (
              <div className="text-xs font-mono text-gray-500 py-8 text-center">No hay proyectos registrados</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => router.push(`/admin/lek?id=${proj.id}`)}
                    className="p-4 border-2 border-gray-400 hover:border-gray-900 bg-[#f3f4de]/20 hover:bg-[#f3f4de]/40 transition-all cursor-pointer flex flex-col justify-between rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold font-display uppercase mt-1 leading-snug group-hover:text-[#dc2a36] transition-all">{proj.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 font-sans">{proj.description || "Sin descripción."}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(proj.id);
                        }}
                        className="w-7 h-7 border border-gray-500 hover:border-[#dc2a36] bg-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 shadow-[1px_1px_0px_rgba(0,0,0,0.15)]"
                        title="Eliminar Proyecto"
                      >
                        <svg className="w-4 h-4 text-gray-700 hover:text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex gap-2 text-[9px] font-mono font-bold text-gray-500 mt-4 pt-2 border-t border-dashed border-gray-300">
                      <span className="bg-gray-250 border border-gray-350 px-2 py-0.5 uppercase">{proj.coursesCount} CURSOS</span>
                      <span className="bg-gray-250 border border-gray-350 px-2 py-0.5 uppercase">{proj.codesCount} CÓDIGOS</span>
                      <span className="text-[#dc2a36] ml-auto group-hover:underline font-mono">Administrar →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
