"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AvatarDropdown } from "./components/ui";
import { useLekConfig, useAuth } from "./hooks";
import { UnlockOverlay } from "./components/auth/UnlockOverlay";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, needsActivation, isFreePlan } = useAuth();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { username } = useLekConfig();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadProjects = async () => {
    if (!isAuthenticated) return [];
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      const sorted = data.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setRecentProjects(sorted);
      return sorted;
    } catch (err) {
      console.error("Error loading projects:", err);
      return [];
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const handleSelectCourse = (id: number) => {
    if (isFreePlan && id > 1) {
      setShowUpgradeModal(true);
      return;
    }
    router.push(`/curso?id=${id}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#f3f4de]">
        <div className="text-sm font-mono font-bold text-gray-700">Cargando aplicación...</div>
      </div>
    );
  }

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
          
          {/* Logo & Greeting - Left */}
          <div className="flex items-center gap-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-9 h-9 overflow-hidden shadow-md shadow-[#dc2a36]/10 shrink-0" 
              viewBox="0 0 1000 1000" 
              fill="none"
            >
              <rect width="1000" height="1000" fill="#DC2A37"/>
              <path d="M67.5 168.106V561.39H394.926L342.115 466.953H186.79V168.106H67.5Z" fill="white"/>
              <path d="M366.346 427.811L439.66 558.905H645.311L589.394 466.953H425.37V403.58H535.962V318.462H425.37V256.953H560.192L608.033 165H304.837V427.811H366.346Z" fill="white"/>
              <path d="M668.299 558.905H718.624V403.58L829.216 558.905H962.796L842.263 354.497L962.796 165H829.216L718.624 318.462V165H645.311L608.033 271.243V427.811L668.299 558.905Z" fill="white"/>
              <path d="M322 723V804.5H231.5V759.5H152.5V804.5H61V723L135 609H249.5L322 723ZM162.5 719.5H221L193.5 666L162.5 719.5Z" fill="white"/>
              <path d="M584 609L632.5 655V711L584 761H452.5V802.5H360V609H584ZM451.5 706.5H531L542 694.5V671L531 661.5H451.5V706.5Z" fill="white"/>
              <path d="M888 609L936.5 655V711L888 761H756.5V802.5H664V609H888ZM755.5 706.5H835L846 694.5V671L835 661.5H755.5V706.5Z" fill="white"/>
            </svg>
            <span className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-gray-900 leading-none">
              Hola {user?.username || username}
            </span>
          </div>

          {/* Points, Notifications & Profile Avatar - Right */}
          <div className="flex items-center gap-3">
            {/* Points (Rocket) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#dc2a36]/10 border border-[#dc2a36]/20 text-[#dc2a36] font-mono text-[11px] font-bold shadow-sm">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L12.688 19.156M14.187 15.904L15 21L11.312 19.156M19 10.5C19 14.366 15 18 12 18C9 18 5 14.366 5 10.5C5 6.634 8 3 12 3C16 3 19 6.634 19 10.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8V11" />
              </svg>
              <span className="font-mono">350 PTS</span>
            </div>

            {/* Notifications Button */}
            <button className="relative w-8.5 h-8.5 border border-gray-300 hover:border-gray-400 bg-white flex items-center justify-center text-gray-700 transition-all hover:bg-gray-50 active:scale-95 cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#dc2a36]" />
            </button>

            {/* Square Profile Avatar Dropdown */}
            <AvatarDropdown />
          </div>
          
        </div>
      </header>

      {/* DASHBOARD CONTENT GRID */}
      <main className="max-w-6xl w-full mx-auto px-6 mt-8 flex-1">
        
        {/* NAVIGATION / BREADCRUMB */}
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
          <span>Inicio</span>
          <span className="text-gray-400 font-mono">•</span>
          <span className="text-gray-900">Dashboard</span>
        </div>

        {/* SECTION 1: APRENDE A USAR TU LEK 2 */}
        <section className="mb-10">
          <div 
            onClick={() => router.push("/cursos?kit=lek2")}
            className="w-full bg-[#dc2a36] hover:bg-[#c02030] text-white border-2 border-[#dc2a36] rounded-none p-6 sm:p-8 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 animate-moving-shadow"
          >
            <div>
              <span className="text-[9px] font-bold bg-white text-[#dc2a36] px-2 py-0.5 uppercase tracking-widest font-mono">KIT ACTIVO</span>
              <h3 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wide mt-2">Aprende a usar tu Lek 2</h3>
              <p className="text-xs sm:text-sm text-white/80 font-sans mt-2 leading-relaxed max-w-2xl">
                Accede a la academia completa de Lek 2. Incluye guías interactivas de armado de chasis, motores de tracción, uso de sensores y retos semanales.
              </p>
              <div className="flex gap-3 text-[10px] font-mono font-bold text-white/90 mt-4">
                <span className="bg-white/10 px-2 py-0.5">4 CURSOS</span>
                <span className="bg-white/10 px-2 py-0.5">22 VIDEOS</span>
                <span className="bg-white/10 px-2 py-0.5">DESAFÍOS</span>
              </div>
            </div>
            <div className="shrink-0 flex items-center">
              <span className="px-5 py-2.5 bg-white text-[#dc2a36] font-bold uppercase tracking-wider text-xs rounded-none transition-all group-hover:bg-[#fbfbf6] active:scale-95 flex items-center gap-1.5 shadow-sm">
                Explorar Cursos →
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 2: LEKCODE ZONE (DARK BANNER WITH MULTICOLOR GLOW SHADOWS ON BUTTON) */}
        <section className="mb-10">
          <div 
            onClick={() => router.push("/lekcode")}
            className="w-full bg-zinc-950 text-white border-2 border-gray-900 rounded-none p-6 sm:p-8 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-5 flex-1">
              {/* SVG Logo - White against dark bg, scaled to w-20 h-15 */}
              <div className="shrink-0 w-20 h-15 bg-zinc-900 border border-zinc-800 flex items-center justify-center p-2">
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
              <div className="flex-1">
                <span className="text-[9px] font-bold bg-[#dc2a36] text-white px-2 py-0.5 uppercase tracking-widest font-mono">ENTORNO DE PROGRAMACIÓN</span>
                <h3 className="text-xl sm:text-2xl font-bold font-display uppercase tracking-wide mt-2">LekCode Zone</h3>
                <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2 leading-relaxed max-w-xl">
                  Crea rutinas para tus motores, configura sensores de luz y distancia, y pon a prueba tu lógica de control. Gestiona todos tus proyectos desde tu panel.
                </p>
                <div className="flex gap-3 text-[10px] font-mono font-bold text-zinc-500 mt-4">
                  <span className="bg-zinc-900 px-2 py-0.5 text-zinc-300 uppercase">{recentProjects.length} LekCodes Guardados</span>
                  <span className="bg-zinc-900 px-2 py-0.5 text-zinc-300">Simulador</span>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center">
              <span className="px-5 py-2.5 bg-white text-gray-900 font-bold uppercase tracking-wider text-xs rounded-none transition-all group-hover:bg-zinc-100 active:scale-95 flex items-center gap-2 border border-gray-900 animate-multicolor-glow-button">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-auto text-gray-900" viewBox="0 0 896 656" fill="none">
                  <path d="M168.5 425.5L204.5 467.5V510.5H139.5V490.5L130 480H82L70.5 490.5V587.5L78 597H130L139.5 587.5V565.5H204.5V610L162.5 655.5H47.5L1 610V467.5L47.5 425.5H168.5Z" fill="currentColor"/>
                  <path d="M436 468V610.5L394 656H279L232.5 610.5V468L279 426H400L436 468ZM311 482L299.5 492.5V589.5L307 599H359L368.5 589.5V492.5L359 482H311Z" fill="currentColor"/>
                  <path d="M631.5 424C633.1 424 665.5 454.667 681.5 470V605.5L631.5 654H471.5V424H631.5ZM541 480V598.5H598L611.5 581V497L592.5 480H541Z" fill="currentColor"/>
                  <path d="M715 655.5H896V598.5H785.5V562H878V510.5H785.5V480H890.5V424H715V655.5Z" fill="currentColor"/>
                  <path d="M0 3.10645V396.39H327.426L274.615 301.953H119.29V3.10645H0Z" fill="currentColor"/>
                  <path d="M298.846 262.811L372.16 393.905H577.811L521.894 301.953H357.87V238.58H468.462V153.462H357.87V91.9527H492.692L540.533 0H237.337V262.811H298.846Z" fill="currentColor"/>
                  <path d="M600.799 393.905H651.124V238.58L761.716 393.905H895.296L774.763 189.497L895.296 0H761.716L651.124 153.462V0H577.811L540.533 106.243V262.811L600.799 393.905Z" fill="currentColor"/>
                </svg>
                Entrar a LekCode →
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 3: CONTINÚA APRENDIENDO (Horizontal scrollable carousel, 1.5 cards on mobile) */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-none bg-[#dc2a36]/10 text-[#dc2a36] flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display uppercase tracking-wider text-gray-900">Continúa Aprendiendo</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-sans">Retoma tus lecciones y videos tutoriales.</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-2 -mx-6 px-6 sm:-mx-0 sm:px-0">
              
              {/* Card 1: Introducción */}
              <div 
                onClick={() => handleSelectCourse(1)}
                className="w-[72%] sm:w-[48%] md:w-[32%] lg:w-[23.5%] shrink-0 snap-start bg-white border border-gray-200/80 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video bg-zinc-950 overflow-hidden shrink-0">
                  {/* Miniature Background & SVG Icon */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#dc2a36]/20 to-zinc-900 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#dc2a36]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {/* Time Duration Tag */}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-1.5 py-0.5 font-mono tracking-wider">8:15</span>
                  {/* Video Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/80">
                    <div className="h-full bg-[#dc2a36] w-full" />
                  </div>
                </div>
                {/* Card Info */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 uppercase">Completado</span>
                      <span className="text-[10px] font-bold text-gray-400 font-mono">CURSO 1</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#dc2a36] transition-colors uppercase font-display tracking-wide">1. Arma tu Lek 2</h3>
                    <p className="text-xs text-gray-500 font-sans line-clamp-2 mt-1 leading-relaxed">Tutorial paso a paso para ensamblar la estructura mecánica, motores y placas de tu kit sin soldadura.</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>Avance:</span>
                    <span className="text-emerald-600 font-bold">100%</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Gamepad */}
              <div 
                onClick={() => handleSelectCourse(2)}
                className="w-[72%] sm:w-[48%] md:w-[32%] lg:w-[23.5%] shrink-0 snap-start bg-white border border-gray-200/80 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video bg-zinc-950 overflow-hidden shrink-0">
                  {/* Miniature Background & SVG Icon */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#dc2a36]/20 to-zinc-900 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#dc2a36]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <rect x="3" y="6" width="18" height="12" stroke="currentColor" strokeWidth={1.5} />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h4M9 10v4M15 12h.01M17 10h.01" />
                    </svg>
                  </div>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {isFreePlan && (
                    <div className="absolute inset-0 bg-black/75 z-10 flex flex-col items-center justify-center gap-1.5">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-[8px] font-mono font-bold text-white uppercase tracking-widest bg-[#dc2a36] px-1 py-0.5">BLOQUEADO</span>
                    </div>
                  )}
                  {/* Time Duration Tag */}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-1.5 py-0.5 font-mono tracking-wider">12:40</span>
                  {/* Video Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/80">
                    <div className="h-full bg-[#dc2a36] w-[45%]" />
                  </div>
                </div>
                {/* Card Info */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100/60 px-1.5 py-0.5 uppercase">En Curso</span>
                      <span className="text-[10px] font-bold text-gray-400 font-mono">CURSO 2</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#dc2a36] transition-colors uppercase font-display tracking-wide">2. Inicio de Programacion</h3>
                    <p className="text-xs text-gray-500 font-sans line-clamp-2 mt-1 leading-relaxed">Aprende a mover motores, crear secuencias sencillas y usar eventos para controlar tu primer código.</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>Avance:</span>
                    <span className="text-orange-600 font-bold">45%</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Física */}
              <div 
                onClick={() => handleSelectCourse(3)}
                className="w-[72%] sm:w-[48%] md:w-[32%] lg:w-[23.5%] shrink-0 snap-start bg-white border border-gray-200/80 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer opacity-85 hover:opacity-100"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video bg-zinc-950 overflow-hidden shrink-0">
                  {/* Miniature Background & SVG Icon */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#dc2a36]/20 to-zinc-900 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#dc2a36]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {isFreePlan && (
                    <div className="absolute inset-0 bg-black/75 z-10 flex flex-col items-center justify-center gap-1.5">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-[8px] font-mono font-bold text-white uppercase tracking-widest bg-[#dc2a36] px-1 py-0.5">BLOQUEADO</span>
                    </div>
                  )}
                  {/* Time Duration Tag */}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-1.5 py-0.5 font-mono tracking-wider">15:10</span>
                  {/* Video Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/80">
                    <div className="h-full bg-[#dc2a36] w-0" />
                  </div>
                </div>
                {/* Card Info */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 uppercase">Pendiente</span>
                      <span className="text-[10px] font-bold text-gray-400 font-mono">CURSO 3</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#dc2a36] transition-colors uppercase font-display tracking-wide">3. Intermedio de Programacion</h3>
                    <p className="text-xs text-gray-500 font-sans line-clamp-2 mt-1 leading-relaxed">Domina variables, bucles complejos, sensores de distancia y lógica condicional para automatizar tu robot.</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>Avance:</span>
                    <span className="text-gray-500 font-bold">0%</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Retos */}
              <div 
                onClick={() => handleSelectCourse(4)}
                className="w-[72%] sm:w-[48%] md:w-[32%] lg:w-[23.5%] shrink-0 snap-start bg-white border border-gray-200/80 rounded-none shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer opacity-85 hover:opacity-100"
              >
                {/* 16:9 Thumbnail */}
                <div className="relative aspect-video bg-zinc-950 overflow-hidden shrink-0">
                  {/* Miniature Background & SVG Icon */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#dc2a36]/20 to-zinc-900 flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#dc2a36]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {isFreePlan && (
                    <div className="absolute inset-0 bg-black/75 z-10 flex flex-col items-center justify-center gap-1.5">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-[8px] font-mono font-bold text-white uppercase tracking-widest bg-[#dc2a36] px-1 py-0.5">BLOQUEADO</span>
                    </div>
                  )}
                  {/* Time Duration Tag */}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-bold px-1.5 py-0.5 font-mono tracking-wider">18:30</span>
                  {/* Video Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/80">
                    <div className="h-full bg-[#dc2a36] w-0" />
                  </div>
                </div>
                {/* Card Info */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 uppercase">Pendiente</span>
                      <span className="text-[10px] font-bold text-gray-400 font-mono">CURSO 4</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#dc2a36] transition-colors uppercase font-display tracking-wide">4. Programacion avanzada</h3>
                    <p className="text-xs text-gray-500 font-sans line-clamp-2 mt-1 leading-relaxed">Descubre cómo analizar los desafíos, estructurar tus soluciones y subir tu puntaje en la comunidad.</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>Avance:</span>
                    <span className="text-gray-500 font-bold">0%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* BOTTOM SECTIONS: RETOS & AYUDA IN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SECCIÓN: RETOS SEMANALES & COMUNIDAD */}
          <section className="bg-white border border-gray-200/80 rounded-none p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-none bg-[#dc2a36]/10 text-[#dc2a36] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold font-display uppercase text-gray-900">Reto Semanal</h2>
                <p className="text-sm text-gray-500 font-sans">Desafíos de la comunidad Lek.</p>
              </div>
            </div>

            <div className="p-4 bg-zinc-900 text-white rounded-none border border-zinc-800">
              <span className="text-[10px] font-bold bg-[#dc2a36] text-white px-2 py-0.5 rounded-none uppercase tracking-wider">Activo</span>
              <div className="flex items-center gap-2 mt-2">
                <svg className="w-4 h-4 text-[#dc2a36] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707-.707m0-12.728l.707.707m12.728 12.728l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <h3 className="text-base font-bold text-zinc-100 font-display">El Laberinto Inteligente</h3>
              </div>
              <p className="text-sm text-zinc-400 font-sans mt-1.5 leading-relaxed">
                Consigue que el chasis de tu Lek 2 recorra todo el circuito en menos de 10 segundos utilizando una sola secuencia de "Repetir".
              </p>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>Recompensa:</span>
                <span className="text-yellow-500 font-bold">Insignia "Loop Master"</span>
              </div>
            </div>
          </section>

          {/* SECCIÓN: AYUDA Y SOPORTE */}
          <section className="bg-white border border-gray-200/80 rounded-none p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-none bg-[#dc2a36]/10 text-[#dc2a36] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold font-display uppercase text-gray-900">Ayuda y Guías</h2>
                <p className="text-sm text-gray-500 font-sans">Tutoriales y soporte técnico para tu kit.</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <a href="#manual" className="flex items-center gap-3.5 p-3.5 bg-[#f8f8f8] hover:bg-gray-100 rounded-none transition-all border border-gray-100 group">
                <div className="w-10 h-10 rounded-none bg-[#dc2a36]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-gray-900 block group-hover:text-[#dc2a36] transition-colors">Guía de Armado Lek 2</span>
                  <span className="text-xs text-gray-400 block font-sans">Manual oficial de ensamble sin soldadura.</span>
                </div>
              </a>

              <a href="#tutoriales" className="flex items-center gap-3.5 p-3.5 bg-[#f8f8f8] hover:bg-gray-100 rounded-none transition-all border border-gray-100 group">
                <div className="w-10 h-10 rounded-none bg-[#dc2a36]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-gray-900 block group-hover:text-[#dc2a36] transition-colors">Videos Tutoriales</span>
                  <span className="text-xs text-gray-400 block font-sans">Aprende a programar paso a paso.</span>
                </div>
              </a>

              <a href="https://wa.me/521" target="_blank" rel="noreferrer" className="flex items-center gap-3.5 p-3.5 bg-[#f8f8f8] hover:bg-gray-100 rounded-none transition-all border border-gray-100 group">
                <div className="w-10 h-10 rounded-none bg-[#dc2a36]/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-[#dc2a36]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-gray-900 block group-hover:text-[#dc2a36] transition-colors">WhatsApp Soporte</span>
                  <span className="text-xs text-gray-400 block font-sans">¿Tienes problemas con tu kit? Escríbenos.</span>
                </div>
              </a>
            </div>
          </section>
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
