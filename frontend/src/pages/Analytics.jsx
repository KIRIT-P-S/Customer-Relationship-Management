import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import api from "../api/axios";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    api.get("/analytics").then(({ data }) => setData(data)).catch(() => {});
    api.get("/analytics/activity").then(({ data }) => setActivity(data)).catch(() => {});
  }, []);

  const colorMap = { green: "bg-green-500", blue: "bg-blue-500", red: "bg-red-500", purple: "bg-purple-500", yellow: "bg-yellow-500", gray: "bg-gray-400" };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Reports</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Lead Conversion", value: `${data?.conversionRate ?? 0}%`, color: "text-green-600", bg: "bg-green-50" },
          { label: "Task Completion", value: `${data?.taskCompletion ?? 0}%`, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Resolution Rate", value: `${data?.resolutionRate ?? 0}%`, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Est. Revenue", value: `$${(data?.totalRevenue ?? 0).toLocaleString()}`, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} p-4 rounded-xl shadow`}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Growth */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-4">Customer Growth (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.monthlyGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Sources */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-4">Lead Sources</h3>
          {data?.leadSources?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.leadSources} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.leadSources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-10">No lead data yet</p>}
        </div>

        {/* Conversion Bar */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-4">Performance Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: "Lead Conversion", value: data?.conversionRate || 0 },
              { name: "Task Completion", value: data?.taskCompletion || 0 },
              { name: "Resolution Rate", value: data?.resolutionRate || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-gray-400 text-sm">No activity yet</p>
            ) : activity.map((a) => (
              <div key={a._id} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colorMap[a.color] || "bg-gray-400"}`} />
                <div>
                  <p className="text-sm">{a.action} — <span className="font-medium">{a.entityName}</span></p>
                  <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
