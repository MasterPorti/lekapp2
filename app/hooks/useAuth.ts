import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserSession {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  unlocked: boolean;
  kit_code: string | null;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const useAuth = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check session on mount
    const savedUser = localStorage.getItem("lek_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Ensure cookie is in sync
        setCookie("lek_user_email", parsed.email);
      } catch (e) {
        console.error("Error parsing saved user session", e);
        localStorage.removeItem("lek_user");
        deleteCookie("lek_user_email");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.unverified) {
          const err = new Error("EMAIL_NOT_VERIFIED") as any;
          err.email = email;
          err.originalMessage = data.error;
          throw err;
        }
        throw new Error(data.error || "Error al iniciar sesión");
      }

      setUser(data.user);
      localStorage.setItem("lek_user", JSON.stringify(data.user));
      setCookie("lek_user_email", data.user.email);

      // Trigger standard event if needed or update lek_config to match username
      const lekConfig = localStorage.getItem("lek_config");
      if (lekConfig) {
        try {
          const cfg = JSON.parse(lekConfig);
          cfg.username = data.user.username;
          cfg.email = data.user.email;
          localStorage.setItem("lek_config", JSON.stringify(cfg));
          window.dispatchEvent(new Event("lek-config-changed"));
        } catch (e) {}
      }

      return data.user as UserSession;
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrarse");
      }
      return true;
    } catch (error: any) {
      throw new Error(error.message || "Error de conexión");
    }
  };

  const verify = async (email: string, code: string) => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error de verificación");
      }

      setUser(data.user);
      localStorage.setItem("lek_user", JSON.stringify(data.user));
      setCookie("lek_user_email", data.user.email);

      // Sync user data to config
      const lekConfig = localStorage.getItem("lek_config");
      if (lekConfig) {
        try {
          const cfg = JSON.parse(lekConfig);
          cfg.username = data.user.username;
          cfg.email = data.user.email;
          localStorage.setItem("lek_config", JSON.stringify(cfg));
          window.dispatchEvent(new Event("lek-config-changed"));
        } catch (e) {}
      }

      return data.user as UserSession;
    } catch (error: any) {
      throw new Error(error.message || "Error de conexión");
    }
  };

  const unlock = async (code: string | null, isFreePlan: boolean) => {
    if (!user) throw new Error("Debe iniciar sesión para desbloquear");

    try {
      const res = await fetch("/api/auth/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code, isFreePlan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al desbloquear");
      }

      // Update state & storage
      setUser(data.user);
      localStorage.setItem("lek_user", JSON.stringify(data.user));
      setCookie("lek_user_email", data.user.email);

      return data.user as UserSession;
    } catch (error: any) {
      throw new Error(error.message || "Error de conexión");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lek_user");
    deleteCookie("lek_user_email");
    router.push("/login");
  };

  return {
    user,
    loading,
    login,
    register,
    verify,
    unlock,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isUnlocked: user?.unlocked === true,
    isFreePlan: user?.kit_code === "FREE_PLAN",
    needsActivation: user !== null && user.unlocked === false && user.kit_code === null,
  };
};
