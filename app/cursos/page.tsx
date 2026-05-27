"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AvatarDropdown } from "../components/ui";
import { useLekConfig, useAuth } from "../hooks";
import { UnlockOverlay } from "../components/auth/UnlockOverlay";


const CourseSkeleton = () => (
  <div className="flex items-center gap-4 border-2 border-gray-300 p-4 bg-white animate-pulse rounded-none">
    {/* Left: Box Skeleton */}
    <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 border-2 border-gray-300 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] rounded-none" />
    
    {/* Right: Info */}
    <div className="min-w-0 flex-1 flex flex-col gap-2">
      <div className="w-1/2 h-5 bg-gray-200 border border-gray-300" />
      <div className="w-1/3 h-3.5 bg-gray-200 border border-gray-300" />
    </div>
  </div>
);

const CursosPageSkeleton = () => (
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
          <div className="w-8 h-8 bg-gray-200 border border-gray-350 rounded-none" />
        </div>
        {/* Profile Avatar Dropdown - Right */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-200 border-2 border-gray-900 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
        </div>
      </div>
    </header>

    <main className="max-w-4xl w-full mx-auto px-6 mt-8 flex-1 flex flex-col">
      {/* Navigation Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
        <div className="w-12 h-3 bg-gray-200 border border-gray-300" />
        <span className="font-mono">•</span>
        <div className="w-16 h-3 bg-gray-200 border border-gray-300" />
        <span className="font-mono">•</span>
        <div className="w-20 h-3 bg-gray-250 border border-gray-300" />
      </div>

      {/* PAGE TITLE */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="w-1/3 h-8 bg-gray-250 border border-gray-300 animate-pulse" />
        <div className="w-1/2 h-4 bg-gray-200 border border-gray-300 animate-pulse" />
        <div className="w-24 h-6 bg-gray-200 border border-gray-300 animate-pulse mt-2" />
      </div>

      {/* SECTION HEADER */}
      <div className="mb-5 mt-4">
        <div className="w-1/2 h-6 bg-gray-250 border border-gray-300 animate-pulse" />
      </div>

      {/* COURSES LIST */}
      <div className="space-y-4 max-w-2xl">
        <CourseSkeleton />
        <CourseSkeleton />
        <CourseSkeleton />
      </div>
    </main>
  </div>
);
function CursosCatalog() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, needsActivation, isFreePlan } = useAuth();
  const { username } = useLekConfig();
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isLoading = authLoading || coursesLoading;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setCoursesLoading(false);
      }
    };
    loadCourses();
  }, [isAuthenticated]);

  const handleGoBack = () => {
    router.push("/");
  };

  const handleSelectCourse = (id: number, isLocked: boolean) => {
    if (isLocked) {
      setShowUpgradeModal(true);
      return;
    }
    router.push(`/curso?id=${id}`);
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

      <main className="max-w-4xl w-full mx-auto px-6 mt-8 flex-1 flex flex-col">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <span className="cursor-pointer hover:text-gray-900" onClick={handleGoBack}>Inicio</span>
          <span className="text-gray-400 font-mono">•</span>
          <span className="cursor-pointer hover:text-gray-900" onClick={handleGoBack}>Dashboard</span>
          <span className="text-gray-400 font-mono">•</span>
          <span className="text-gray-900">Ruta de Lek 2</span>
        </div>

        {/* PAGE TITLE */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-wide text-gray-900">
            Ruta de Lek 2
          </h1>
          <p className="text-sm text-gray-600 font-sans mt-1 font-bold">
            Pasa de 0 a Experto con tu lek 2
          </p>
          <div className="mt-3 flex items-center">
            <span className="bg-[#dc2a36] text-white text-[11px] font-bold font-mono px-2.5 py-1 uppercase border border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {isLoading ? "..." : courses.length} Cursos
            </span>
          </div>
        </div>

        {/* SECTION HEADER */}
        <div className="mb-5 mt-4">
          <h2 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-gray-900 border-b-2 border-gray-900 pb-2">
            De 0 a Experto con tu LEK 2
          </h2>
        </div>

        {/* COURSES LIST */}
        <div className="space-y-4 max-w-2xl">
          {isLoading ? (
            <>
              <CourseSkeleton />
              <CourseSkeleton />
              <CourseSkeleton />
            </>
          ) : courses.length === 0 ? (
            <div className="text-xs font-mono text-gray-500 p-8 border-2 border-dashed border-gray-400 text-center">
              No hay cursos disponibles.
            </div>
          ) : (
            courses.map((course, index) => {
              const isLocked = isFreePlan && index > 0;
              return (
                <div 
                  key={course.id}
                  onClick={() => handleSelectCourse(course.id, isLocked)}
                  className={`flex items-center gap-4 border-2 p-4 transition-all rounded-none ${
                    isLocked 
                      ? "bg-gray-100/50 border-gray-300 opacity-60 cursor-not-allowed" 
                      : "bg-white border-gray-900 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer group"
                  }`}
                >
                  {/* Left: Branded LekCode Logo Box */}
                  <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 text-white flex items-center justify-center p-2.5 border-2 border-gray-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isLocked ? "bg-gray-400" : "bg-[#dc2a36]"}`}>
                    {isLocked ? (
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white" viewBox="0 0 896 656" fill="none">
                        <path d="M168.5 425.5L204.5 467.5V510.5H139.5V490.5L130 480H82L70.5 490.5V587.5L78 597H130L139.5 587.5V565.5H204.5V610L162.5 655.5H47.5L1 610V467.5L47.5 425.5H168.5Z" fill="currentColor"/>
                        <path d="M436 468V610.5L394 656H279L232.5 610.5V468L279 426H400L436 468ZM311 482L299.5 492.5V589.5L307 599H359L368.5 589.5V492.5L359 482H311Z" fill="currentColor"/>
                        <path d="M631.5 424C633.1 424 665.5 454.667 681.5 470V605.5L631.5 654H471.5V424H631.5ZM541 480V598.5H598L611.5 581V497L592.5 480H541Z" fill="currentColor"/>
                        <path d="M715 655.5H896V598.5H785.5V562H878V510.5H785.5V480H890.5V424H715V655.5Z" fill="currentColor"/>
                        <path d="M0 3.10645V396.39H327.426L274.615 301.953H119.29V3.10645H0Z" fill="currentColor"/>
                        <path d="M298.846 262.811L372.16 393.905H577.811L521.894 301.953H357.87V238.58H468.462V153.462H357.87V91.9527H492.692L540.533 0H237.337V262.811H298.846Z" fill="currentColor"/>
                        <path d="M600.799 393.905H651.124V238.58L761.716 393.905H895.296L774.763 189.497L895.296 0H761.716L651.124 153.462V0H577.811L540.533 106.243V262.811L600.799 393.905Z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>

                  {/* Right: Only the pure title */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg font-bold font-display uppercase tracking-wide transition-all ${isLocked ? "text-gray-400" : "text-gray-900 group-hover:text-[#dc2a36]"}`}>
                      {course.title}
                    </h3>
                    {isLocked && (
                      <span className="text-[9px] font-mono font-bold text-[#dc2a36] uppercase tracking-wider block mt-0.5">
                        Requiere kit completo
                      </span>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  <div className="shrink-0 text-gray-400 group-hover:text-[#dc2a36] transition-all">
                    {isLocked ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          )}
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


export default function CursosPage() {
  return (
    <Suspense fallback={<CursosPageSkeleton />}>
      <CursosCatalog />
    </Suspense>
  );
}
