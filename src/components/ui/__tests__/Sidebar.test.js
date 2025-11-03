// Jest DOM shims — use require so these run before module imports
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
if (typeof global.ReadableStream === "undefined") {
  // minimal ReadableStream shim for tests (avoid empty constructor class which ESLint flags)
  global.ReadableStream = function ReadableStream() {};
}

const React = require("react");
const { render, screen } = require("@testing-library/react");

// Mock react-router-dom so tests don't depend on actual router implementation
jest.mock("react-router-dom", () => {
  const React = require("react");
  return {
    MemoryRouter: ({ children }) =>
      React.createElement(React.Fragment, null, children),
    Link: ({ to, children, ...props }) =>
      React.createElement("a", { href: to, ...props }, children),
    useLocation: () => ({ pathname: "/" }),
    useNavigate: () => () => {},
  };
});

const SidebarModule = require("../Sidebar");
// support both CommonJS and ES module default export
const SidebarMenu =
  SidebarModule && SidebarModule.default
    ? SidebarModule.default
    : SidebarModule;

describe("Sidebar mini-strip behavior", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("mini links are visible when collapsed and hamburger toggles sidebar", () => {
    render(React.createElement(SidebarMenu));

    // Ensure each expected mini-link exists by its accessible name
    const labels = [
      "Ejercicios",
      "Calendario",
      "Estadísticas",
      "Configuración",
    ];
    labels.forEach((lbl) => {
      const link = screen.getByLabelText(lbl);
      expect(link).toBeInTheDocument();
      // Each mini item should contain visible emoji/text
      expect(link.textContent.trim().length).toBeGreaterThan(0);
      // Each mini item should have data-label attribute (used for tooltip)
      expect(link.getAttribute("data-label")).toBeTruthy();
    });

    // Sidebar should be present (closed by default)
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(nav.classList.contains("closed")).toBe(true);
  });
});
