"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AvatarDropdown } from "../components/ui";
import { useLekConfig, useAuth } from "../hooks";
import { UnlockOverlay } from "../components/auth/UnlockOverlay";

interface Video {
  id: string;
  title: string;
  duration: string;
  description: string;
  url: string;
  isFree?: boolean;
}

interface Course {
  id: number;
  title: string;
  badge: string;
  videos: Video[];
}

function CursoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAuthenticated, isFreePlan, needsActivation } = useAuth();
  const { username } = useLekConfig();
  const courseIdParam = searchParams.get("id");
  
  const [courseId, setCourseId] = useState(1);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [course, setCourse] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Set course ID from URL query parameters
  useEffect(() => {
    if (courseIdParam) {
      const parsed = parseInt(courseIdParam, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        setCourseId(parsed);
      }
    }
    setActiveVideoIndex(0);
  }, [courseIdParam]);

  // Auth Redirects
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch Course from DB and validate plan access
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadCourseData = async () => {
      setCourseLoading(true);
      try {
        // Fetch all courses to see if this course is the first one in the list (index 0)
        const coursesRes = await fetch("/api/courses");
        if (coursesRes.ok) {
          const coursesList = await coursesRes.json();
          const targetIndex = coursesList.findIndex((c: any) => c.id === courseId);
          
          if (isFreePlan && targetIndex > 0) {
            alert("Este curso pertenece al plan completo. ¡Por favor activa tu kit LEK!");
            router.push("/cursos");
            return;
          }
        }

        // Fetch detailed course with videos
        const res = await fetch(`/api/courses?id=${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        }
      } catch (err) {
        console.error("Error loading course details:", err);
      } finally {
        setCourseLoading(false);
      }
    };

    loadCourseData();
  }, [courseId, isAuthenticated, isFreePlan, router]);

  const handleGoBack = () => {
    router.push("/cursos");
  };

  const playlist: Video[] = course?.videos || [];
  const currentVideo = playlist[activeVideoIndex] || {
    title: "Sin video",
    duration: "0:00",
    description: "No hay videos disponibles.",
    url: "",
  };
  const isLockedVideo = isFreePlan && !currentVideo.isFree;

  if (authLoading || !isAuthenticated || courseLoading) {
    return <CursoPageSkeleton />;
  }

  const currentCourse = {
    title: course?.title || "Curso",
    badge: course?.badge || "Curso",
  };

  return (
    <div 
      className="relative min-h-dvh flex flex-col bg-[#f3f4de] text-gray-900 font-sans select-none pb-12"
      style={{
        backgroundImage: 'radial-gradient(rgba(220, 42, 55, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* HEADER / NAVIGATION BAR */}
      <header className="w-full bg-white/70 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          
          {/* Back button - Left */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleGoBack}
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

      <main className="max-w-6xl w-full mx-auto px-0 sm:px-6 mt-4 sm:mt-8 flex-1 flex flex-col">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-xs font-bold text-gray-500 uppercase tracking-widest px-5 sm:px-0">
          <span className="cursor-pointer hover:text-gray-900" onClick={() => router.push("/")}>Inicio</span>
          <span className="text-gray-400 font-mono">•</span>
          <span className="cursor-pointer hover:text-gray-900" onClick={() => router.push("/cursos")}>Dashboard</span>
          <span className="text-gray-400 font-mono">•</span>
          <span className="text-gray-900">{currentCourse.title}</span>
        </div>

        {/* ACADEMY SECTION ROW (Brutalist panel split) */}
        <div className="bg-white border-y sm:border border-gray-200/80 rounded-none w-full shadow-md flex flex-col lg:flex-row overflow-hidden min-h-[650px] lg:min-h-[550px]">
          
          {/* LEFT COLUMN: PLAYER AND METADATA */}
          <div className="flex-1 flex flex-col p-5 sm:p-6 md:p-8 md:border-r md:border-gray-200 bg-white">
            {/* Header info */}
            <div className="mb-5">
              <span className="text-[10px] font-bold text-[#dc2a36] bg-[#dc2a36]/10 border border-[#dc2a36]/20 px-2 py-0.5 uppercase tracking-wider block w-fit mb-1.5 font-mono">
                {currentCourse.badge} • {currentCourse.title}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wide text-gray-900 leading-tight">
                {currentVideo.title}
              </h1>
            </div>

            {/* Video Player box */}
            <div className="relative aspect-video w-[calc(100%+2.5rem)] -mx-5 sm:w-full sm:mx-0 bg-zinc-950 border-y border-gray-300 sm:border shadow-sm shrink-0 overflow-hidden">
              {isLockedVideo ? (
                <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center text-center p-6 select-none text-white z-10">
                  <div className="w-14 h-14 bg-[#dc2a36] border-2 border-gray-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] text-white flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold font-display uppercase tracking-wide">Clase del Plan Completo</h3>
                  <p className="text-[11px] text-zinc-400 mt-2 max-w-xs leading-relaxed">
                    Esta lección requiere un kit LEK activo. Por favor, ingresa tu código de kit para desbloquear.
                  </p>
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="mt-4 px-4 py-2 bg-[#dc2a36] hover:bg-[#c02030] border-2 border-white text-white font-bold uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer rounded-none active:scale-95"
                  >
                    Activar Kit Completo
                  </button>
                </div>
              ) : currentVideo.url ? (
                <video
                  key={currentVideo.id}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay={activeVideoIndex > 0}
                  src={currentVideo.url}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 font-mono text-xs">
                  <svg className="w-12 h-12 text-zinc-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 00-2-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>No hay video disponible</span>
                </div>
              )}
            </div>

            {/* Class description */}
            <div className="mt-6 flex-1">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Descripción de la clase</h2>
              <p className="text-sm text-gray-700 font-sans mt-2 leading-relaxed bg-[#fbfbf6] border border-gray-200 p-5 rounded-none shadow-inner">
                {currentVideo.description}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: PLAYLIST SIDEBAR */}
          <div className="w-full lg:w-[360px] bg-gray-50 flex flex-col shrink-0 border-t border-gray-200 lg:border-t-0">
            
            {/* Sidebar Title */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-100/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-display">Clases del Curso</span>
              </div>
              <span className="text-[10px] font-bold text-gray-600 font-mono px-2 py-0.5 bg-gray-200/80">
                {playlist.length} VIDEOS
              </span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-200/60 max-h-[400px] lg:max-h-[600px]">
              {playlist.map((video, index) => {
                const isActive = index === activeVideoIndex;
                const isLocked = isFreePlan && !video.isFree;
                const isCompleted = index === 0; // Mock completed state for the first video
                
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => {
                      if (isLocked) {
                        setShowUpgradeModal(true);
                      } else {
                        setActiveVideoIndex(index);
                      }
                    }}
                    className={`w-full p-4 text-left transition-all flex items-start gap-4 cursor-pointer border-l-4 ${
                      isActive
                        ? "bg-white border-l-[#dc2a36] hover:bg-white"
                        : "border-l-transparent hover:bg-white/40"
                    }`}
                  >
                    {/* Lesson Index */}
                    <span className={`text-xs font-mono font-bold w-4 shrink-0 text-center mt-0.5 ${isActive ? "text-[#dc2a36]" : "text-gray-400"}`}>
                      {(index + 1).toString().padStart(2, "0")}
                    </span>

                    {/* Miniature representation */}
                    <div className="relative w-14 aspect-video bg-zinc-950 shrink-0 border border-gray-300 overflow-hidden flex items-center justify-center shadow-sm">
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {isLocked ? (
                          <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : isActive ? (
                          <svg className="w-3.5 h-3.5 text-[#dc2a36] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className={`text-xs font-bold leading-tight block truncate ${isActive ? "text-[#dc2a36]" : "text-gray-700"}`}>
                        {video.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-mono tracking-wider font-bold">
                          {video.duration} MIN
                        </span>
                        {isCompleted && (
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100/60 border border-emerald-200/60 px-1 font-mono uppercase tracking-wider scale-95 origin-left">
                            Visto
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sidebar bottom action link to code editor */}
            <div className="p-4 bg-gray-100 border-t border-gray-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  const newId = "proj-" + Math.random().toString(36).substring(2, 9);
                  router.push(`/editor?id=${newId}`);
                }}
                className="w-full py-2 px-4 bg-[#dc2a36] hover:bg-[#c02030] active:scale-[0.98] text-white font-bold rounded-none text-xs uppercase tracking-wider text-center transition-all cursor-pointer shadow-md shadow-[#dc2a36]/15 flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Crear LekCode
              </button>
              <button
                onClick={() => router.push("/lekcode")}
                className="w-full py-2 px-4 bg-white hover:bg-gray-100 border border-gray-300 active:scale-[0.98] text-gray-700 font-bold rounded-none text-xs uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.856-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                </svg>
                Ver mis LekCodes
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 text-center text-gray-400 text-[10px] tracking-widest uppercase font-sans">
        LEK • Learning Educational Kit
      </footer>

      {(needsActivation || showUpgradeModal) && (
        <UnlockOverlay 
          onUnlocked={() => {
            setShowUpgradeModal(false);
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
}


const CursoPageSkeleton = () => (
  <div 
    className="relative min-h-dvh flex flex-col bg-[#f3f4de] text-gray-900 font-sans select-none pb-12"
    style={{
      backgroundImage: 'radial-gradient(rgba(220, 42, 55, 0.08) 1.5px, transparent 1.5px)',
      backgroundSize: '24px 24px'
    }}
  >
    {/* HEADER / NAVIGATION BAR */}
    <header className="w-full bg-white/70 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30 px-6 py-4">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        {/* Back button - Left */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 border border-gray-300 rounded-none" />
        </div>
        {/* Profile Avatar Dropdown - Right */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-200 border-2 border-gray-900 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
        </div>
      </div>
    </header>

    <main className="max-w-6xl w-full mx-auto px-0 sm:px-6 mt-4 sm:mt-8 flex-1 flex flex-col">
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6 text-xs font-bold text-gray-400 uppercase tracking-widest px-5 sm:px-0 animate-pulse">
        <div className="w-12 h-3 bg-gray-200" />
        <span className="font-mono">•</span>
        <div className="w-16 h-3 bg-gray-200" />
        <span className="font-mono">•</span>
        <div className="w-24 h-3 bg-gray-250" />
      </div>

      {/* ACADEMY SECTION ROW (Brutalist panel split) */}
      <div className="bg-white border-y sm:border border-gray-200/80 rounded-none w-full shadow-md flex flex-col lg:flex-row overflow-hidden min-h-[650px] lg:min-h-[550px]">
        
        {/* LEFT COLUMN: PLAYER AND METADATA SKELETON */}
        <div className="flex-1 flex flex-col p-5 sm:p-6 md:p-8 md:border-r md:border-gray-200 bg-white animate-pulse">
          {/* Header info */}
          <div className="mb-5 flex flex-col gap-2">
            <div className="w-24 h-4 bg-gray-200 border border-gray-300" />
            <div className="w-1/2 h-7 bg-gray-250 border border-gray-300" />
          </div>

          {/* Video Player Box Skeleton */}
          <div className="relative aspect-video w-[calc(100%+2.5rem)] -mx-5 sm:w-full sm:mx-0 bg-gray-200 border-y border-gray-300 sm:border shadow-sm shrink-0 overflow-hidden" />

          {/* Class description Skeleton */}
          <div className="mt-6 flex-1 flex flex-col gap-2">
            <div className="w-32 h-4 bg-gray-250 border border-gray-300" />
            <div className="w-full h-24 bg-gray-200 border border-gray-300" />
          </div>
        </div>

        {/* RIGHT COLUMN: PLAYLIST SIDEBAR SKELETON */}
        <div className="w-full lg:w-[360px] bg-gray-50 flex flex-col shrink-0 border-t border-gray-200 lg:border-t-0 animate-pulse">
          {/* Sidebar Title */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-100/60 flex items-center justify-between">
            <div className="w-28 h-4 bg-gray-250 border border-gray-300" />
            <div className="w-16 h-4 bg-gray-200 border border-gray-300" />
          </div>

          {/* Scrollable list of skeletons */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200/60 max-h-[400px] lg:max-h-[600px] p-2 flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="w-full p-3 flex items-start gap-4 bg-white border border-gray-200">
                <div className="w-4 h-4 bg-gray-200 mt-1" />
                <div className="w-14 aspect-video bg-gray-200 border border-gray-300 shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="w-3/4 h-4 bg-gray-250 border border-gray-300" />
                  <div className="w-12 h-3.5 bg-gray-200 border border-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);
export default function CursoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3f4de] flex items-center justify-center font-mono text-xs text-gray-500">
        Cargando clase...
      </div>
    }>
      <CursoContent />
    </Suspense>
  );
}
