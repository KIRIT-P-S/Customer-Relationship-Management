import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import SalesChart from "../components/SalesChart";
import AIInsights from "../components/AIInsights";
import AIChat from "../components/AIChat";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role === "Customer") { navigate("/portal"); return; }
    loadStats();
  }, []);

  const loadStats = () =>
    api.get("/ai/insights").then(({ data }) => setStats(data)).catch(() => {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <span className="text-sm text-gray-500">Welcome, {user.name} ({user.role})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: stats?.totalCustomers, color: "" },
          { label: "Active Leads", value: stats?.totalLeads, color: "" },
          { label: "Churn Risk", value: stats?.churnRisk, color: "text-red-500" },
          { label: "Pending Tasks", value: stats?.pendingTasks, color: "" },
          { label: "Active Customers", value: stats?.activeCustomers, color: "text-green-600" },
          { label: "At Risk Customers", value: stats?.atRiskCount, color: "text-orange-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white p-4 shadow rounded">
            <p className="text-gray-500 text-sm">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value ?? "—"}</p>
          </div>
        ))}
      </div>

      <SalesChart />
      <AIInsights stats={stats} />
      {/* AI Chat with action callback to refresh stats */}
      <AIChat onActionDone={loadStats} />
    </div>
  );
}
