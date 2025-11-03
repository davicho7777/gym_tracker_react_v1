import React, { createContext, useContext, useEffect, useState } from "react";
import * as LS from "../services/LocalStorageService";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setThemeState] = useState(() => LS.getMode() || "default");
  const [autoTheme, setAutoTheme] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ui-mode-auto")) || false;
    } catch (e) {
      return false;
    }
  });
  const [themeSchedule, setThemeScheduleState] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("ui-mode-schedule")) || {
          type: "time",
          from: "19:00",
          to: "07:00",
        }
      );
    } catch (e) {
      return { type: "time", from: "19:00", to: "07:00" };
    }
  });
  const [units, setUnitsState] = useState(() => LS.getUnits() || "kg");

  // Persist changes
  useEffect(() => {
    LS.setMode(theme);
  }, [theme]);

  // Apply theme classes to document body so the entire app reflects the chosen theme
  useEffect(() => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    document.body.classList.toggle("tripi-mode", theme === "tripi");
    document.body.classList.toggle("vivid-mode", theme === "vivid");
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("ui-mode-auto", JSON.stringify(!!autoTheme));
    } catch (e) {}
  }, [autoTheme]);

  useEffect(() => {
    try {
      localStorage.setItem("ui-mode-schedule", JSON.stringify(themeSchedule));
    } catch (e) {}
  }, [themeSchedule]);

  useEffect(() => {
    LS.setUnits(units);
  }, [units]);

  // Cross-tab sync
  useEffect(() => {
    function onStorage(e) {
      if (!e.key) return;
      if (e.key === "ui-mode") setThemeState(e.newValue || "default");
      if (e.key === "ui-mode-auto")
        setAutoTheme(JSON.parse(e.newValue || "false"));
      if (e.key === "ui-mode-schedule")
        setThemeScheduleState(JSON.parse(e.newValue || "{}"));
      if (e.key === "settings-units") setUnitsState(e.newValue || "kg");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = (t) => setThemeState(t || "default");
  const setThemeSchedule = (s) =>
    setThemeScheduleState(s || { type: "time", from: "19:00", to: "07:00" });
  const setUnits = (u) => setUnitsState(u || "kg");

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        autoTheme,
        setAutoTheme,
        themeSchedule,
        setThemeSchedule,
        units,
        setUnits,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export default SettingsContext;
