import { useEffect, useState } from "react";
import api from "../api/axios";
import SalesChart from "../components/SalesChart";
import AIInsights from "../components/AIInsights";
import AIChat from "../components/AIChat";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/ai/insights").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500">Total Customers</p>
          <p className="text-2xl font-bold">{stats?.totalCustomers ?? "—"}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500">Active Leads</p>
          <p className="text-2xl font-bold">{stats?.totalLeads ?? "—"}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500">Churn Risk</p>
          <p className="text-2xl font-bold text-red-500">{stats?.churnRisk ?? "—"}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500">Pending Tasks</p>
          <p className="text-2xl font-bold">{stats?.pendingTasks ?? "—"}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500">Active Customers</p>
          <p className="text-2xl font-bold text-green-600">{stats?.activeCustomers ?? "—"}</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <p className="text-gray-500">At Risk Customers</p>
          <p className="text-2xl font-bold text-orange-500">{stats?.atRiskCount ?? "—"}</p>
        </div>
      </div>

      <SalesChart />
      <AIInsights stats={stats} />
      <AIChat />
    </div>
  );
}
