import { useState, useEffect } from "react";
import "./styles/global.css";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectListPage from "./pages/ProjectListPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import DashboardPage from "./pages/DashboardPage";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import JoinedTeamsPage from "./pages/JoinedTeamsPage";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("collab_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [authPage, setAuthPage] = useState("login");
  const [page, setPage] = useState("projects");

  const [theme, setTheme] = useState(() =>
    localStorage.getItem("collab_theme") || "dark"
  );
  const toggleTheme = () => {
    setTheme(t => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("collab_theme", next);
      return next;
    });
  };
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleLogin = (student) => {
    sessionStorage.setItem("collab_user", JSON.stringify(student));
    setUser(student);
    setPage("projects");
  };
  const handleLogout = () => {
    sessionStorage.removeItem("collab_user");
    setUser(null);
    setAuthPage("login");
  };

  if (!user) {
    return authPage === "login" ? (
      <LoginPage
        onLogin={handleLogin}
        onGoRegister={() => setAuthPage("register")}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    ) : (
      <RegisterPage
        onRegistered={handleLogin}
        onGoLogin={() => setAuthPage("login")}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <>
      <div className="mesh-bg" />
      <Navbar
        user={user}
        page={page}
        setPage={setPage}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {page === "projects"      && <ProjectListPage user={user} />}
      {page === "create"        && <CreateProjectPage user={user} onCreated={() => setPage("projects")} />}
      {page === "dashboard"     && <DashboardPage user={user} />}

      {/* ── New pages ── */}
      {page === "profile"       && <ProfilePage user={user} />}
      {page === "notifications" && <NotificationsPage user={user} />}
      {page === "joined"        && <JoinedTeamsPage user={user} />}
    </>
  );
}