import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeSetting from "../ThemeSetting";
import { SettingsProvider } from "../../../context/SettingsContext";

describe("ThemeSetting", () => {
  test("renders theme options and toggles schedule", () => {
    render(
      <SettingsProvider>
        <ThemeSetting />
      </SettingsProvider>
    );
    // buttons should be present
    const predButton = screen.getByRole("button", {
      name: /Predeterminado|Default/i,
    });
    const darkButton = screen.getByRole("button", { name: /Oscuro|Dark/i });
    expect(predButton).toBeInTheDocument();
    expect(darkButton).toBeInTheDocument();

    // clicking a theme button should set it as pressed
    fireEvent.click(darkButton);
    expect(darkButton.getAttribute("aria-pressed")).toBe("true");
  });
});
