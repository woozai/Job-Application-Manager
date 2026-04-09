import { NavLink, Outlet } from "react-router-dom";

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

        <nav aria-label="Primary" className="app-shell__nav">
          {navigationGroups.map((group) => (
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
      </header>

      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
