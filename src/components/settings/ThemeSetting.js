import React from "react";
import { useSettings } from "../../context/SettingsContext";
import Button from "../ui/button";

const THEMES = [
  { key: "default", label: "Predeterminado", variant: "ghost" },
  { key: "dark", label: "Oscuro", variant: "outline" },
  { key: "tripi", label: "Tripi", variant: "primary" },
  { key: "vivid", label: "Neo Brutalismo", variant: "neutral" },
];

export default function ThemeSetting() {
  const { theme, setTheme } = useSettings();

  const onThemeSelect = (key) => () => setTheme(key);

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Apariencia</h2>

      <div
        className="button-container"
        role="tablist"
        aria-label="Selector de tema"
      >
        {THEMES.map((t) => (
          <Button
            key={t.key}
            variant={t.variant}
            size="md"
            className={`mr-2 ${theme === t.key ? "btn--active" : ""}`}
            onClick={onThemeSelect(t.key)}
            aria-pressed={theme === t.key}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-3">
        Selecciona un tema para la aplicación. El tema predeterminado aplica la
        apariencia base.
      </p>
    </section>
  );
}
