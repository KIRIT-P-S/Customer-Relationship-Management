import { useState, useEffect } from "react";
import api from "../api/axios";

const statusColor = (s) => ({
  Open: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700"
}[s] || "");

const sentimentColor = (s) => ({
  positive: "text-green-600", negative: "text-red-600", urgent: "text-red-700 font-bold", neutral: "text-gray-500"
}[s] || "text-gray-500");

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = () => api.get("/complaints").then(({ data }) => setComplaints(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/complaints/${id}`, { status });
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        {user.role === "Agent" ? "My Assigned Complaints" : "All Complaints"}
      </h2>

      {complaints.length === 0 ? (
        <div className="bg-white p-6 shadow rounded text-center text-gray-400">No complaints found</div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white shadow rounded p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm">{c.text}</p>
                  {c.aiSummary && <p className="text-xs text-gray-400 italic mt-1">{c.aiSummary}</p>}
                  <div className="flex gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span>Customer: <span className="font-medium text-gray-700">{c.customer?.name}</span></span>
                    <span>Category: <span className="font-medium">{c.category}</span></span>
                    <span className={sentimentColor(c.sentiment)}>Sentiment: {c.sentiment}</span>
                    <span>Agent: <span className="font-medium text-blue-600">{c.assignedTo?.name || "Unassigned"}</span></span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${statusColor(c.status)}`}>{c.status}</span>
                  {(user.role === "Admin" || user.role === "Agent") && c.status !== "Resolved" && (
                    <select value={c.status}
                      onChange={(e) => updateStatus(c._id, e.target.value)}
                      className="text-xs border rounded p-1">
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
