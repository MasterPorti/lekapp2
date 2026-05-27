import { useState, useEffect } from "react";

export interface LekConfig {
  username: string;
  email: string;
  soundEffects: boolean;
  autoSave: boolean;
  notifications: boolean;
  themeColor: string;
}

const DEFAULT_CONFIG: LekConfig = {
  username: "Julio",
  email: "julio@lekrobotics.com",
  soundEffects: true,
  autoSave: true,
  notifications: true,
  themeColor: "red",
};

export const useLekConfig = () => {
  const [config, setConfig] = useState<LekConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem("lek_config");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing lek_config", e);
      }
    } else {
      // Initialize with default
      localStorage.setItem("lek_config", JSON.stringify(DEFAULT_CONFIG));
    }

    const handleConfigChange = () => {
      const updated = localStorage.getItem("lek_config");
      if (updated) {
        try {
          setConfig(JSON.parse(updated));
        } catch (e) {
          console.error("Error parsing lek_config", e);
        }
      }
    };

    window.addEventListener("lek-config-changed", handleConfigChange);
    return () => {
      window.removeEventListener("lek-config-changed", handleConfigChange);
    };
  }, []);

  const updateConfig = (newConfig: Partial<LekConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem("lek_config", JSON.stringify(updated));
    window.dispatchEvent(new Event("lek-config-changed"));
  };

  return {
    ...config,
    config,
    updateConfig,
  };
};
