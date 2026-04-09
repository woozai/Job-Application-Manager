import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

const navigationGroups = [
  {
    label: "Workspace",
    links: [{ to: "/dashboard", label: "Dashboard" }],
  },
  {
    label: "Account",
    links: [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
    ],
  },
];

export function AppShell() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const userInitial = currentUser?.username.trim().charAt(0).toUpperCase() ?? "?";
  const visibleNavigationGroups = navigationGroups.filter((group) =>
    group.label === "Account" ? !isAuthenticated : true,
  );
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__brand">
          <p className="app-shell__eyebrow">Job Search Operating System</p>
          <h1>Job Application Manager</h1>
          <p className="app-shell__subtitle">
            Keep every opportunity, contact, and next step in one focused workspace.
          </p>
        </div>

        <div className="app-shell__topbar">
          <nav aria-label="Primary" className="app-shell__nav">
            {visibleNavigationGroups.map((group) => (
              <section key={group.label} className="app-shell__nav-group">
                <p className="app-shell__nav-group-label">{group.label}</p>

                <div className="app-shell__nav-links">
                  {group.links.map((link) => (
                    <NavLink
                      key={link.to}
                      className={({ isActive }) =>
                        isActive
                          ? "app-shell__nav-link app-shell__nav-link--active"
                          : "app-shell__nav-link"
                      }
                      to={link.to}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <div className="app-shell__session">
            {isAuthenticated && currentUser ? (
              <div className="app-shell__profile-menu" ref={profileMenuRef}>
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  className="app-shell__profile-trigger"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  type="button"
                >
                  <div className="app-shell__avatar" aria-hidden="true">
                    {userInitial}
                  </div>
                  <div className="app-shell__session-details">
                    <strong>{currentUser.username}</strong>
                  </div>
                </button>

                {isProfileMenuOpen ? (
                  <div className="app-shell__profile-dropdown" role="menu">
                    <p className="app-shell__profile-email">{currentUser.email}</p>
                    <button
                      className="app-shell__dropdown-action"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="app-shell__session-empty">
                Sign in to access your private dashboard and saved job applications.
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
