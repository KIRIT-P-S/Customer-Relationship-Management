import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: "🏠", roles: ["Admin", "Agent"] },
  { path: "/customers", label: "Customers", icon: "👥", roles: ["Admin", "Agent"] },
  { path: "/leads", label: "Leads", icon: "🎯", roles: ["Admin", "Agent"] },
  { path: "/tasks", label: "Tasks", icon: "✅", roles: ["Admin", "Agent"] },
  { path: "/complaints", label: "Complaints", icon: "📋", roles: ["Admin", "Agent"] },
  { path: "/analytics", label: "Analytics", icon: "📊", roles: ["Admin"] },
  { path: "/portal", label: "My Portal", icon: "🎫", roles: ["Customer"] },
  { path: "/profile", label: "Profile", icon: "👤", roles: ["Admin", "Agent", "Customer"] },
  { path: "/settings", label: "Settings", icon: "⚙️", roles: ["Admin", "Agent", "Customer"] },
];

export default function Sidebar({ dark, setDark }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [collapsed, setCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  const filtered = navItems.filter(n => n.roles.includes(user.role));

  return (
    <aside className={`${collapsed ? "w-16" : "w-56"} transition-all duration-200 min-h-screen flex flex-col ${dark ? "bg-gray-900 text-white" : "bg-blue-700 text-white"} shadow-xl`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-blue-600">
        {!collapsed && <span className="text-lg font-bold tracking-wide">AI CRM</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white opacity-70 hover:opacity-100 text-xl">
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* User badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-blue-600">
          <p className="text-sm font-semibold truncate">{user.name}</p>
          <span className="text-xs bg-white text-blue-700 px-2 py-0.5 rounded-full font-bold">{user.role}</span>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {filtered.map(({ path, label, icon }) => (
          <Link key={path} to={path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              location.pathname === path
                ? "bg-white text-blue-700 font-semibold"
                : "hover:bg-blue-600 text-white"
            }`}>
            <span className="text-base">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-blue-600 space-y-2">
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
