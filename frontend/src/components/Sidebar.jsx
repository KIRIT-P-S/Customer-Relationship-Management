import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios";

const navItems = [
  { path: "/", label: "Dashboard", icon: "🏠", roles: ["Admin", "Agent"] },
  { path: "/customers", label: "Customers", icon: "👥", roles: ["Admin", "Agent"] },
  { path: "/leads", label: "Leads", icon: "🎯", roles: ["Admin", "Agent"] },
  { path: "/pipeline", label: "Pipeline", icon: "📊", roles: ["Admin", "Agent"] },
  { path: "/tasks", label: "Tasks", icon: "✅", roles: ["Admin", "Agent"] },
  { path: "/calendar", label: "Calendar", icon: "📅", roles: ["Admin", "Agent"] },
  { path: "/reminders", label: "Reminders", icon: "🔔", roles: ["Admin", "Agent"] },
  { path: "/complaints", label: "Complaints", icon: "📋", roles: ["Admin", "Agent"] },
  { path: "/email", label: "Email AI", icon: "✉️", roles: ["Admin", "Agent"] },
  { path: "/analytics", label: "Analytics", icon: "📈", roles: ["Admin"] },
  { path: "/admin", label: "Admin Panel", icon: "🛡️", roles: ["Admin"] },
  { path: "/portal", label: "My Portal", icon: "🎫", roles: ["Customer"] },
  { path: "/profile", label: "Profile", icon: "👤", roles: ["Admin", "Agent", "Customer"] },
  { path: "/settings", label: "Settings", icon: "⚙️", roles: ["Admin", "Agent", "Customer"] },
];

export default function Sidebar({ dark, setDark }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [collapsed, setCollapsed] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCount = () =>
      api.get("/reminders/unread-count").then(({ data }) => setReminderCount(data.count)).catch(() => {});
    fetchCount();
    const interval = setInterval(fetchCount, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;
  const filtered = navItems.filter(n => n.roles.includes(user.role));

  return (
    <aside className={`${collapsed ? "w-16" : "w-60"} transition-all duration-200 min-h-screen flex flex-col ${dark ? "bg-gray-900 text-white" : "bg-blue-700 text-white"} shadow-xl flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-blue-600">
        {!collapsed && <span className="text-lg font-bold tracking-wide">🤖 AI CRM</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white opacity-70 hover:opacity-100 text-xl ml-auto">
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* User badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-blue-600">
          <p className="text-sm font-semibold truncate">{user.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-white text-blue-700 px-2 py-0.5 rounded-full font-bold">{user.role}</span>
            {reminderCount > 0 && (
              <Link to="/reminders" className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                🔔 {reminderCount}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
        {filtered.map(({ path, label, icon }) => {
          const isReminder = path === "/reminders";
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                location.pathname === path
                  ? "bg-white text-blue-700 font-semibold"
                  : "hover:bg-blue-600 text-white"
              }`}>
              <span className="text-base flex-shrink-0">{icon}</span>
              {!collapsed && (
                <span className="flex-1">{label}</span>
              )}
              {!collapsed && isReminder && reminderCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{reminderCount}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-blue-600 space-y-1">
        <button onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-600 text-sm">
          <span>{dark ? "☀️" : "🌙"}</span>
          {!collapsed && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500 text-sm">
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
