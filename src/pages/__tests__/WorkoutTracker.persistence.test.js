// Jest shims for some Node APIs used by firebase/undici in tests
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
if (typeof global.ReadableStream === "undefined") {
  // minimal ReadableStream shim for tests
  global.ReadableStream = function ReadableStream() {};
}

const React = require("react");
const { render, screen, fireEvent } = require("@testing-library/react");

// Mock react-router-dom for test stability (provide Link/useLocation/useNavigate)
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

const WorkoutModule = require("../WorkoutTracker");
// support both CommonJS and ES module default export
const WorkoutTracker =
  WorkoutModule && WorkoutModule.default
    ? WorkoutModule.default
    : WorkoutModule;
const { SettingsProvider } = require("../../context/SettingsContext");

describe("WorkoutTracker persistence behavior", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("mode toggle persists to localStorage and body class is applied", () => {
    render(
      React.createElement(
        SettingsProvider,
        null,
        React.createElement(WorkoutTracker)
      )
    );

    const modeButton = screen.getByRole("button", { name: /Modo:/ });
    // initially default
    expect(modeButton.textContent).toMatch(/Predeterminado/);

    // click to go to dark
    fireEvent.click(modeButton);
    expect(localStorage.getItem("ui-mode")).toBe("dark");
    expect(document.body.classList.contains("dark-mode")).toBe(true);
  });

  test("rep counter input updates localStorage", () => {
    render(
      React.createElement(
        SettingsProvider,
        null,
        React.createElement(WorkoutTracker)
      )
    );

    // find rep inputs by placeholder (RepCounter uses placeholder="0")
    const repsInputs = screen.getAllByPlaceholderText("0");
    expect(repsInputs.length).toBeGreaterThan(0);

    const target = repsInputs[0];
    fireEvent.change(target, { target: { value: "7" } });

    // assert some localStorage key for reps was set to '7'
    const keys = Object.keys(localStorage);
    const repKey = keys.find((k) => k.startsWith("reps-"));
    expect(repKey).toBeTruthy();
    expect(localStorage.getItem(repKey)).toBe("7");
  });
});
