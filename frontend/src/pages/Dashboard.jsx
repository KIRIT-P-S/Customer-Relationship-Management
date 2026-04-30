import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import AIChat from "../components/AIChat";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role === "Customer") { navigate("/portal"); return; }
    loadAll();
  }, []);

  const loadAll = () => {
    api.get("/ai/insights").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/analytics").then(({ data }) => setAnalytics(data)).catch(() => {});
    api.get("/analytics/activity").then(({ data }) => setActivity(data.slice(0, 8))).catch(() => {});
  };

  const colorMap = { green: "bg-green-500", blue: "bg-blue-500", red: "bg-red-500", purple: "bg-purple-500", yellow: "bg-yellow-500", gray: "bg-gray-400" };

  const kpis = [
    { label: "Total Customers", value: stats?.totalCustomers, icon: "👥", color: "bg-blue-50 text-blue-700" },
    { label: "Active Leads", value: stats?.totalLeads, icon: "🎯", color: "bg-purple-50 text-purple-700" },
    { label: "Pending Tasks", value: stats?.pendingTasks, icon: "✅", color: "bg-yellow-50 text-yellow-700" },
    { label: "Churn Risk", value: stats?.churnRisk, icon: "⚠️", color: "bg-red-50 text-red-700" },
    { label: "Active Customers", value: stats?.activeCustomers, icon: "✨", color: "bg-green-50 text-green-700" },
    { label: "Lead Conversion", value: `${analytics?.conversionRate ?? 0}%`, icon: "📈", color: "bg-indigo-50 text-indigo-700" },
  ];

  const quickActions = [
    { label: "Add Customer", path: "/customers", icon: "👤" },
    { label: "Add Lead", path: "/leads", icon: "🎯" },
    { label: "Add Task", path: "/tasks", icon: "📝" },
    { label: "View Analytics", path: "/analytics", icon: "📊" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome back, {user.name} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(({ label, value, icon, color }) => (
          <div key={label} className={`${color} p-4 rounded-xl shadow-sm`}>
            <div className="text-2xl mb-1">{icon}</div>
            <p className="text-2xl font-bold">{value ?? "—"}</p>
            <p className="text-xs opacity-75">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map(({ label, path, icon }) => (
          <Link key={path} to={path} className="bg-white shadow rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium text-gray-600">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-4">Customer Growth</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics?.monthlyGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activity.length === 0 ? <p className="text-gray-400 text-sm">No activity yet</p> :
              activity.map((a) => (
                <div key={a._id} className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colorMap[a.color] || "bg-gray-400"}`} />
                  <div>
                    <p className="text-xs">{a.action} — <span className="font-medium">{a.entityName}</span></p>
                    <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* AI Chat */}
      <AIChat onActionDone={loadAll} />
    </div>
  );
}
