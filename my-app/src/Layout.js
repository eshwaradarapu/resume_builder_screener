import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

function Layout({ children, handleLogout }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard (Jobs)", icon: "💼" },
    { path: "/templates", label: "Templates", icon: "📄" },
    { path: "/analyzer", label: "Job Analyzer", icon: "🔎" },
    { path: "/profile", label: "Edit Profile", icon: "✏️" }
  ];

  return (
    <div className="layout-container">
      <aside className="sidebar glass-effect">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-mark">AI</div>
            <div className="brand-text">
              <div className="brand-name">AI Resume Builder</div>
              <div className="brand-tagline">Smart career assistant</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="content-wrapper glass-effect">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
