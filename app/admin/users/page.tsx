"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

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

  // Load all users
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      loadUsers();
    }
  }, [user]);

  const handleToggleUnlockUser = async (userId: number) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_unlock", userId }),
      });
      if (res.ok) {
        loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Error al cambiar estado");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeUserRole = async (userId: number, role: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_role", userId, role }),
      });
      if (res.ok) {
        loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Error al cambiar rol");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario de forma permanente?")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar usuario");
      }
    } catch (e) {
      console.error(e);
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
            <button
              onClick={() => router.push("/admin")}
              className="mr-2 flex items-center justify-center w-8 h-8 bg-zinc-800 border border-zinc-700 hover:border-[#dc2a36] text-gray-300 hover:text-white rounded-none transition-all active:scale-95 cursor-pointer"
              title="Volver al panel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="bg-[#dc2a36] text-white px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider border border-white">
              ADMIN
            </span>
            <h1 className="text-base sm:text-lg font-bold font-display uppercase tracking-widest leading-none">
              Gestión de Usuarios
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

      {/* USERS TAB CONTENT */}
      <main className="max-w-7xl w-full mx-auto px-6 mt-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-[fadeIn_0.2s_ease-out]">
        {/* COLUMN 1: STATS & SECURITY INFO (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none">
            <h3 className="text-sm font-bold font-display uppercase tracking-wide border-b-2 border-gray-900 pb-2 mb-4">
              Información de Seguridad
            </h3>
            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-[#dc2a36]/5 border-2 border-[#dc2a36]/30 p-3 rounded-none">
                <h4 className="font-bold text-gray-900 uppercase font-display mb-1.5">Algoritmo de Hashing</h4>
                <p className="text-gray-600 font-sans leading-relaxed">
                  Las contraseñas de los usuarios nuevos y actualizados se guardan cifradas utilizando <strong>PBKDF2-SHA512</strong> con una sal (salt) criptográfica aleatoria única por usuario y 1000 iteraciones.
                </p>
                <p className="text-gray-600 font-mono text-[9px] mt-2 bg-white/60 p-1 border border-gray-300">
                  Formato DB: salt:hash_hex
                </p>
              </div>

              <div className="bg-amber-50 border-2 border-amber-500/30 p-3 rounded-none">
                <h4 className="font-bold text-amber-900 uppercase font-display mb-1.5">Soporte Legacy</h4>
                <p className="text-amber-800 font-sans leading-relaxed">
                  El sistema detecta si una contraseña guardada no tiene sal (formato texto plano antiguo) y permite al usuario iniciar sesión de forma transparente, pero marca su estado como inseguro para indicar que requiere actualización.
                </p>
              </div>

              <div className="border-t-2 border-gray-900 pt-3">
                <div className="flex justify-between items-center py-1.5 font-bold font-mono">
                  <span className="text-gray-500 uppercase">Total Usuarios:</span>
                  <span className="text-base text-gray-900">{users.length}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 font-bold font-mono border-t border-gray-200">
                  <span className="text-gray-500 uppercase">Administradores:</span>
                  <span className="text-base text-gray-900">
                    {users.filter((u) => u.role === "admin").length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 font-bold font-mono border-t border-gray-200">
                  <span className="text-gray-500 uppercase">Desbloqueados:</span>
                  <span className="text-base text-gray-900">
                    {users.filter((u) => u.unlocked).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COLUMN 2: USERS LIST (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border-4 border-gray-900 p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none flex-1 flex flex-col min-h-[400px]">
            <h3 className="text-sm font-bold font-display uppercase tracking-wide border-b-2 border-gray-900 pb-2 mb-4">
              Usuarios Registrados
            </h3>

            {usersLoading ? (
              <div className="text-xs font-mono text-gray-500 py-12 text-center flex-1 flex items-center justify-center">
                Cargando usuarios...
              </div>
            ) : users.length === 0 ? (
              <div className="text-xs font-mono text-gray-500 py-12 text-center flex-1 flex items-center justify-center">
                No hay usuarios registrados en el sistema
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-900 font-mono text-xs font-bold text-gray-600 bg-gray-50">
                      <th className="py-2 px-3">Usuario / Email</th>
                      <th className="py-2 px-3">Rol</th>
                      <th className="py-2 px-3">Seguridad</th>
                      <th className="py-2 px-3">Acceso Cursos</th>
                      <th className="py-2 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-xs text-gray-900">{u.username}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                            className="text-[10px] font-mono font-bold bg-[#f3f4de]/30 border border-gray-400 px-1 py-0.5 rounded-none focus:outline-none focus:bg-white cursor-pointer"
                          >
                            <option value="user">USER</option>
                            <option value="admin">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-3 px-3 text-[10px] font-mono">
                          {u.passwordSecurity.includes("PBKDF2") ? (
                            <span className="text-emerald-750 font-bold flex items-center gap-1" title={u.passwordSecurity}>
                              <svg className="w-3 h-3 text-emerald-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Seguro (Salt)
                            </span>
                          ) : (
                            <span className="text-amber-750 font-bold flex items-center gap-1" title={u.passwordSecurity}>
                              <svg className="w-3.5 h-3.5 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Inseguro (Plano)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleToggleUnlockUser(u.id)}
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border text-center transition-all cursor-pointer ${
                                u.unlocked
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                                  : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                              }`}
                            >
                              {u.unlocked ? "DESBLOQUEADO" : "BLOQUEADO"}
                            </button>
                            {u.kitCode && (
                              <span className="text-[8px] font-mono text-gray-400 block truncate max-w-[125px]">
                                Código: {u.kitCode}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {u.email !== user?.email ? (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-xs font-bold text-[#dc2a36] hover:text-[#c02030] hover:underline cursor-pointer bg-transparent border-none"
                            >
                              Eliminar
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-gray-400 italic">Eres tú</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
