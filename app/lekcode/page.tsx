"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AvatarDropdown } from "../components/ui";
import { useLekConfig, useAuth } from "../hooks";
import { UnlockOverlay } from "../components/auth/UnlockOverlay";
import { generateRandomName } from "../utils/randomNames";

interface Project {
  id: string;
  name: string;
  updatedAt: string;
  blocks?: any[];
}

export default function LekCodeHubPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, needsActivation, isFreePlan } = useAuth();
  const { username } = useLekConfig();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadProjects = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const sorted = data.sort(
        (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setProjects(sorted);
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const createNewProject = () => {
    if (isFreePlan) {
      alert("La creación de nuevos LekCodes está restringida en el plan gratis. ¡Ingresa tu código de kit LEK para desbloquear todos los accesos!");
      return;
    }
    const newId = "proj-" + Math.random().toString(36).substring(2, 9);
    router.push(`/editor?id=${newId}`);
  };

  const handleLoadProject = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este LekCode?")) return;
    try {
      await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      loadProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleStartRename = (project: Project) => {
    setEditingId(project.id);
    setRenameInput(project.name);
  };

  const handleSaveRename = async (id: string) => {
    const trimmed = renameInput.trim();
    if (!trimmed) {
      setEditingId(null);
      return;
    }
    try {
      const proj = projects.find((p) => p.id === id);
      if (proj) {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name: trimmed, blocks: proj.blocks || [] }),
        });
        loadProjects();
      }
    } catch (err) {
      console.error("Error renaming project:", err);
    }
    setEditingId(null);
  };

  // Filter projects by search query
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f3f4de] flex items-center justify-center font-mono text-xs text-gray-500">
        Cargando LekCode...
      </div>
    );
  }

  return (
    <div
      className="relative min-h-dvh flex flex-col bg-[#f3f4de] text-gray-900 font-sans pb-12"
      style={{
        backgroundImage: "radial-gradient(rgba(220, 42, 55, 0.08) 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header className="w-full bg-white/70 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          
          {/* Back button - Left */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/")}
              className="flex items-center justify-center w-8 h-8 bg-[#f3f4de] border border-gray-300 hover:border-[#dc2a36] text-gray-700 hover:text-[#dc2a36] rounded-none transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Volver"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>

          {/* Profile Avatar Dropdown - Right */}
          <div className="flex items-center gap-3">
            <AvatarDropdown beigeBg />
          </div>
          
        </div>
      </header>

      {/* HUB CONTENT */}
      <main className="max-w-6xl w-full mx-auto px-6 mt-8 flex-1 flex flex-col">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <button
            onClick={() => router.push("/")}
            className="hover:text-gray-900 transition-colors cursor-pointer"
          >
            Inicio
          </button>
          <span className="text-gray-400 font-mono">•</span>
          <span className="text-gray-900">LekCode Zone</span>
        </div>

        {/* Banner de Bienvenida / LekCode Header Card */}
        <div className="w-full bg-zinc-950 text-white border-2 border-gray-900 rounded-none p-6 sm:p-8 mb-8 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden animate-moving-shadow">
          {/* Subtle background dots inside banner */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(white 1.5px, transparent 1.5px)", backgroundSize: "20px 20px" }} />
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 flex-1 z-10">
            {/* SVG Logo - White against dark bg */}
            <div className="shrink-0 w-16 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white" viewBox="0 0 896 656" fill="none">
                <path d="M168.5 425.5L204.5 467.5V510.5H139.5V490.5L130 480H82L70.5 490.5V587.5L78 597H130L139.5 587.5V565.5H204.5V610L162.5 655.5H47.5L1 610V467.5L47.5 425.5H168.5Z" fill="white"/>
                <path d="M436 468V610.5L394 656H279L232.5 610.5V468L279 426H400L436 468ZM311 482L299.5 492.5V589.5L307 599H359L368.5 589.5V492.5L359 482H311Z" fill="white"/>
                <path d="M631.5 424C633.1 424 665.5 454.667 681.5 470V605.5L631.5 654H471.5V424H631.5ZM541 480V598.5H598L611.5 581V497L592.5 480H541Z" fill="white"/>
                <path d="M715 655.5H896V598.5H785.5V562H878V510.5H785.5V480H890.5V424H715V655.5Z" fill="white"/>
                <path d="M0 3.10645V396.39H327.426L274.615 301.953H119.29V3.10645H0Z" fill="white"/>
                <path d="M298.846 262.811L372.16 393.905H577.811L521.894 301.953H357.87V238.58H468.462V153.462H357.87V91.9527H492.692L540.533 0H237.337V262.811H298.846Z" fill="white"/>
                <path d="M600.799 393.905H651.124V238.58L761.716 393.905H895.296L774.763 189.497L895.296 0H761.716L651.124 153.462V0H577.811L540.533 106.243V262.811L600.799 393.905Z" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center justify-center w-7 h-7 bg-zinc-900 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white rounded-none transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Volver al Dashboard"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wider text-white">
                  LekCode Zone
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-1">
                Gestiona y crea tus programas de bloques para el robot Lek 2.
              </p>
            </div>
          </div>

          <button
            onClick={createNewProject}
            className="py-2.5 px-5 bg-white hover:bg-zinc-100 active:scale-[0.98] text-gray-900 font-bold rounded-none border border-gray-950 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs uppercase tracking-wider animate-multicolor-glow-button z-10 self-start sm:self-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo LekCode
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main LekCodes List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Search and Filters */}
            <div className="bg-white border border-gray-200 p-4 shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar tus LekCodes por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-none text-xs font-bold text-gray-900 focus:outline-none focus:border-[#dc2a36] focus:bg-white transition-all font-sans"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* LekCodes Cards List */}
            {filteredProjects.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed border-gray-300 bg-white/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-auto text-gray-300 mx-auto mb-4 opacity-40 shrink-0" viewBox="0 0 896 656" fill="none">
                  <path d="M168.5 425.5L204.5 467.5V510.5H139.5V490.5L130 480H82L70.5 490.5V587.5L78 597H130L139.5 587.5V565.5H204.5V610L162.5 655.5H47.5L1 610V467.5L47.5 425.5H168.5Z" fill="currentColor"/>
                  <path d="M436 468V610.5L394 656H279L232.5 610.5V468L279 426H400L436 468ZM311 482L299.5 492.5V589.5L307 599H359L368.5 589.5V492.5L359 482H311Z" fill="currentColor"/>
                  <path d="M631.5 424C633.1 424 665.5 454.667 681.5 470V605.5L631.5 654H471.5V424H631.5ZM541 480V598.5H598L611.5 581V497L592.5 480H541Z" fill="currentColor"/>
                  <path d="M715 655.5H896V598.5H785.5V562H878V510.5H785.5V480H890.5V424H715V655.5Z" fill="currentColor"/>
                  <path d="M0 3.10645V396.39H327.426L274.615 301.953H119.29V3.10645H0Z" fill="currentColor"/>
                  <path d="M298.846 262.811L372.16 393.905H577.811L521.894 301.953H357.87V238.58H468.462V153.462H357.87V91.9527H492.692L540.533 0H237.337V262.811H298.846Z" fill="currentColor"/>
                  <path d="M600.799 393.905H651.124V238.58L761.716 393.905H895.296L774.763 189.497L895.296 0H761.716L651.124 153.462V0H577.811L540.533 106.243V262.811L600.799 393.905Z" fill="currentColor"/>
                </svg>
                <p className="text-sm font-bold text-gray-500 font-sans">
                  {searchQuery ? "No se encontraron LekCodes con ese nombre." : "No tienes ningún LekCode guardado aún."}
                </p>
                {!searchQuery && (
                  <button
                    onClick={createNewProject}
                    className="mt-4 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded-none transition-all cursor-pointer border border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-95"
                  >
                    Crear tu primer programa
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((project) => {
                  const blocksCount = project.blocks?.length || 0;
                  const isEditing = editingId === project.id;

                  return (
                    <div
                      key={project.id}
                      className="bg-white border-2 border-gray-900 p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Header Details */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[9px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 uppercase">
                            {project.id.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-[#dc2a36] font-bold">
                            {blocksCount} {blocksCount === 1 ? "bloque" : "bloques"}
                          </span>
                        </div>

                        {/* Title Name Edit Inline */}
                        {isEditing ? (
                          <input
                            type="text"
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            onBlur={() => handleSaveRename(project.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(project.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            autoFocus
                            className="bg-white border border-[#dc2a36]/50 text-gray-900 font-sans text-xs px-2.5 py-1 rounded-none outline-none w-full"
                          />
                        ) : (
                          <h3
                            onClick={() => handleStartRename(project)}
                            className="text-sm font-bold text-gray-900 truncate hover:text-[#dc2a36] cursor-pointer flex items-center gap-2 group"
                            title="Haz clic para renombrar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-auto text-[#dc2a36] group-hover:scale-110 transition-all shrink-0" viewBox="0 0 896 656" fill="none">
                              <path d="M168.5 425.5L204.5 467.5V510.5H139.5V490.5L130 480H82L70.5 490.5V587.5L78 597H130L139.5 587.5V565.5H204.5V610L162.5 655.5H47.5L1 610V467.5L47.5 425.5H168.5Z" fill="currentColor"/>
                              <path d="M436 468V610.5L394 656H279L232.5 610.5V468L279 426H400L436 468ZM311 482L299.5 492.5V589.5L307 599H359L368.5 589.5V492.5L359 482H311Z" fill="currentColor"/>
                              <path d="M631.5 424C633.1 424 665.5 454.667 681.5 470V605.5L631.5 654H471.5V424H631.5ZM541 480V598.5H598L611.5 581V497L592.5 480H541Z" fill="currentColor"/>
                              <path d="M715 655.5H896V598.5H785.5V562H878V510.5H785.5V480H890.5V424H715V655.5Z" fill="currentColor"/>
                              <path d="M0 3.10645V396.39H327.426L274.615 301.953H119.29V3.10645H0Z" fill="currentColor"/>
                              <path d="M298.846 262.811L372.16 393.905H577.811L521.894 301.953H357.87V238.58H468.462V153.462H357.87V91.9527H492.692L540.533 0H237.337V262.811H298.846Z" fill="currentColor"/>
                              <path d="M600.799 393.905H651.124V238.58L761.716 393.905H895.296L774.763 189.497L895.296 0H761.716L651.124 153.462V0H577.811L540.533 106.243V262.811L600.799 393.905Z" fill="currentColor"/>
                            </svg>
                            <span className="truncate">{project.name}</span>
                            <svg className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </h3>
                        )}

                        {/* Modified Time */}
                        <p className="text-[10px] text-gray-400 font-sans mt-1.5">
                          Modificado: {new Date(project.updatedAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartRename(project)}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 active:scale-90 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-none transition-all cursor-pointer"
                            title="Renombrar"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-1.5 bg-gray-100 hover:bg-red-500/10 hover:text-red-600 border border-gray-300 rounded-none active:scale-90 text-gray-500 transition-all cursor-pointer"
                            title="Eliminar LekCode"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <button
                          onClick={() => handleLoadProject(project.id)}
                          className="px-4 py-1.5 bg-[#dc2a36] hover:bg-[#c02030] active:scale-95 text-white text-[11px] font-bold rounded-none border border-gray-900 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          Abrir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            
            {/* Active Kit Info Card */}
            <div className="bg-white border-2 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-gray-900 mb-3 pb-2 border-b border-gray-200">
                Dispositivo Vinculado
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#dc2a36]/10 text-[#dc2a36] flex items-center justify-center border border-[#dc2a36]/20 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6.5 h-auto text-[#dc2a36]" viewBox="0 0 896 656" fill="none">
                    <path d="M168.5 425.5L204.5 467.5V510.5H139.5V490.5L130 480H82L70.5 490.5V587.5L78 597H130L139.5 587.5V565.5H204.5V610L162.5 655.5H47.5L1 610V467.5L47.5 425.5H168.5Z" fill="currentColor"/>
                    <path d="M436 468V610.5L394 656H279L232.5 610.5V468L279 426H400L436 468ZM311 482L299.5 492.5V589.5L307 599H359L368.5 589.5V492.5L359 482H311Z" fill="currentColor"/>
                    <path d="M631.5 424C633.1 424 665.5 454.667 681.5 470V605.5L631.5 654H471.5V424H631.5ZM541 480V598.5H598L611.5 581V497L592.5 480H541Z" fill="currentColor"/>
                    <path d="M715 655.5H896V598.5H785.5V562H878V510.5H785.5V480H890.5V424H715V655.5Z" fill="currentColor"/>
                    <path d="M0 3.10645V396.39H327.426L274.615 301.953H119.29V3.10645H0Z" fill="currentColor"/>
                    <path d="M298.846 262.811L372.16 393.905H577.811L521.894 301.953H357.87V238.58H468.462V153.462H357.87V91.9527H492.692L540.533 0H237.337V262.811H298.846Z" fill="currentColor"/>
                    <path d="M600.799 393.905H651.124V238.58L761.716 393.905H895.296L774.763 189.497L895.296 0H761.716L651.124 153.462V0H577.811L540.533 106.243V262.811L600.799 393.905Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Lek 2 Robot</h4>
                  <p className="text-[10px] text-gray-500 font-mono">Estado: Conectado virtual</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2 text-xs font-sans text-gray-600">
                <div className="flex justify-between">
                  <span>Mis LekCodes:</span>
                  <span className="font-bold font-mono">{projects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Puntos Ganados:</span>
                  <span className="font-bold font-mono text-[#dc2a36]">350 PTS</span>
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div className="bg-gray-900 text-white border-2 border-gray-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white mb-3 pb-2 border-b border-zinc-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-auto text-white shrink-0" viewBox="0 0 896 656" fill="none">
                  <path d="M168.5 425.5L204.5 467.5V510.5H139.5V490.5L130 480H82L70.5 490.5V587.5L78 597H130L139.5 587.5V565.5H204.5V610L162.5 655.5H47.5L1 610V467.5L47.5 425.5H168.5Z" fill="currentColor"/>
                  <path d="M436 468V610.5L394 656H279L232.5 610.5V468L279 426H400L436 468ZM311 482L299.5 492.5V589.5L307 599H359L368.5 589.5V492.5L359 482H311Z" fill="currentColor"/>
                  <path d="M631.5 424C633.1 424 665.5 454.667 681.5 470V605.5L631.5 654H471.5V424H631.5ZM541 480V598.5H598L611.5 581V497L592.5 480H541Z" fill="currentColor"/>
                  <path d="M715 655.5H896V598.5H785.5V562H878V510.5H785.5V480H890.5V424H715V655.5Z" fill="currentColor"/>
                  <path d="M0 3.10645V396.39H327.426L274.615 301.953H119.29V3.10645H0Z" fill="currentColor"/>
                  <path d="M298.846 262.811L372.16 393.905H577.811L521.894 301.953H357.87V238.58H468.462V153.462H357.87V91.9527H492.692L540.533 0H237.337V262.811H298.846Z" fill="currentColor"/>
                  <path d="M600.799 393.905H651.124V238.58L761.716 393.905H895.296L774.763 189.497L895.296 0H761.716L651.124 153.462V0H577.811L540.533 106.243V262.811L600.799 393.905Z" fill="currentColor"/>
                </svg>
                <span>LekCode Tips</span>
              </h3>
              <ul className="text-xs font-sans text-zinc-300 space-y-3 list-disc pl-4 leading-relaxed">
                <li>
                  Arrastra un bloque del selector a la placa para programar.
                </li>
                <li>
                  Los bloques naranjas de <strong className="text-orange-400">eventos</strong> deben ir siempre al inicio de tus rutinas.
                </li>
                <li>
                  Haz clic en el engrane superior para probar tus rutinas en el simulador interactivo de 4 motores.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </main>

      {needsActivation && <UnlockOverlay onUnlocked={() => window.location.reload()} />}
    </div>
  );
}
