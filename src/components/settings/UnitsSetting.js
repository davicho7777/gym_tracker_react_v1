import React from "react";
import { useSettings } from "../../context/SettingsContext";
import Button from "../ui/button";

export default function UnitsSetting() {
  const { units, setUnits } = useSettings();

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Unidades</h2>
      <div
        className="button-container"
        role="tablist"
        aria-label="Selector de unidades"
      >
        <Button
          variant={units === "kg" ? "primary" : "neutral"}
          size="sm"
          onClick={() => setUnits("kg")}
          className="mr-2"
          aria-pressed={units === "kg"}
        >
          Kilogramos (kg)
        </Button>
        <Button
          variant={units === "kg" ? "neutral" : "primary"}
          size="sm"
          onClick={() => setUnits("lb")}
          aria-pressed={units === "lb"}
        >
          Libras (lb)
        </Button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Las unidades por defecto son kilogramos (kg).
      </p>
    </section>
  );
}
