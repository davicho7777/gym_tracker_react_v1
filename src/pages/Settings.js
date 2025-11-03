import React from "react";
import Sidebar from "../components/ui/Sidebar";
import { useSettings } from "../context/SettingsContext";
import ThemeSetting from "../components/settings/ThemeSetting";
import UnitsSetting from "../components/settings/UnitsSetting";
import Button from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  // read settings so the page updates when theme/units change
  const { theme } = useSettings();
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <div>
      {/* Sidebar is fixed; main content should use main-with-sidebar to avoid being covered */}
      <Sidebar />
      <main className="main-with-sidebar container mx-auto p-4" role="main">
        <h1 className="text-2xl font-bold text-center mb-4">Configuración</h1>
        <ThemeSetting />
        <UnitsSetting />
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="md" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
        <div className="mt-4 text-sm text-gray-600">Tema activo: {theme}</div>
      </main>
    </div>
  );
};

export default Settings;
