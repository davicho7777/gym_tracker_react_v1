import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./button";

const SidebarMenu = () => {
  // keep closed by default; only open when user clicks the hamburger
  const [isOpen, setIsOpen] = useState(false);
  const observerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const checkOverflow = () => {
      const main = document.querySelector(".main-with-sidebar");
      if (!main) return;
      // currently we don't use needsCollapse but keep the check available for future use
      const overflowsVert = main.scrollHeight > window.innerHeight;
      const overflowsHoriz = main.scrollWidth > window.innerWidth;
      return overflowsVert || overflowsHoriz;
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    const main = document.querySelector(".main-with-sidebar");
    if (main && window.MutationObserver) {
      observerRef.current = new MutationObserver(checkOverflow);
      observerRef.current.observe(main, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      window.removeEventListener("resize", checkOverflow);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  // toggleMenu removed — using inline setIsOpen where needed

  return (
    <>
      {/* Render the main sidebar first so sibling CSS selectors can adjust main content */}
      <nav
        className={`sidebar ${isOpen ? "open" : "closed"}`}
        aria-label="Main navigation"
        role="navigation"
      >
        <div id="sidebar-menu" className="sidebar-content">
          <h2 className="sidebar-title">Menú</h2>
          <ul className="sidebar-list">
            <li>
              <Link to="/workout-tracker">
                <Button
                  variant="outline"
                  className={`sidebar-btn ${
                    location.pathname === "/workout-tracker" ? "active" : ""
                  }`}
                >
                  Ejercicios
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/calendar">
                <Button
                  variant="outline"
                  className={`sidebar-btn ${
                    location.pathname === "/calendar" ? "active" : ""
                  }`}
                >
                  Calendario
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/Estadisticas">
                <Button
                  variant="outline"
                  className={`sidebar-btn ${
                    location.pathname === "/Estadisticas" ? "active" : ""
                  }`}
                >
                  Estadísticas
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/settings">
                <Button
                  variant="outline"
                  className={`sidebar-btn ${
                    location.pathname === "/settings" ? "active" : ""
                  }`}
                >
                  Configuración
                </Button>
              </Link>
            </li>
            <li>
              <Link to="/login">
                <Button variant="outline" className="sidebar-btn">
                  Log Out
                </Button>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mini-strip with hamburger always visible; mini-links only when collapsed */}
      {/* Mini-strip: always show compact icons (no hamburger). */}
      <div className="sidebar-mini" aria-hidden={false}>
        <MiniLinks locationPath={location.pathname} />
      </div>

      {/* Overlay for small screens */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

const MiniLinks = ({ locationPath }) => {
  // compact links: exercises, calendar, stats, settings. Logout intentionally omitted here.
  const items = [
    { to: "/workout-tracker", emoji: "🏋️‍♀️", label: "Ejercicios" },
    { to: "/calendar", emoji: "📅", label: "Calendario" },
    { to: "/Estadisticas", emoji: "📈", label: "Estadísticas" },
    { to: "/settings", emoji: "⚙️", label: "Configuración" },
  ];

  return (
    <div className="sidebar-mini-links">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`sidebar-mini-item ${
            locationPath === item.to ? "active" : ""
          }`}
          title={item.label}
          aria-label={item.label}
          data-label={item.label}
        >
          <span className="mini-emoji" aria-hidden>
            {item.emoji}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default SidebarMenu;
