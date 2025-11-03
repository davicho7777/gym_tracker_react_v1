import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UnitsSetting from "../UnitsSetting";
import { SettingsProvider } from "../../../context/SettingsContext";

describe("UnitsSetting", () => {
  test("renders and switches units", () => {
    render(
      <SettingsProvider>
        <UnitsSetting />
      </SettingsProvider>
    );

    const kgBtn = screen.getByRole("button", { name: /Kilogramos/i });
    const lbBtn = screen.getByRole("button", { name: /Libras/i });
    expect(kgBtn).toBeInTheDocument();
    expect(lbBtn).toBeInTheDocument();

    // click lb and expect it to be pressed
    fireEvent.click(lbBtn);
    expect(lbBtn.getAttribute("aria-pressed")).toBe("true");
  });
});
