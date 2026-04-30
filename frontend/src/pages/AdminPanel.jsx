import { useState, useEffect } from "react";
import api from "../api/axios";

const roleBadge = { Admin: "bg-red-100 text-red-700", Agent: "bg-blue-100 text-blue-700", Customer: "bg-green-100 text-green-700" };

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [msg, setMsg] = useState("");

  const load = () => {
    api.get("/admin/users").then(({ data }) => setUsers(data)).catch(() => {});
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const updateUser = async (id, updates) => {
    await api.put(`/admin/users/${id}`, updates);
    setMsg("User updated!"); setTimeout(() => setMsg(""), 2000);
    setEditUser(null); load();
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Panel</h2>
      {msg && <div className="bg-green-100 text-green-700 p-3 rounded text-sm">{msg}</div>}

      {/* System Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Users", value: stats.users, icon: "👤" },
            { label: "Customers", value: stats.customers, icon: "👥" },
            { label: "Leads", value: stats.leads, icon: "🎯" },
            { label: "Tasks", value: stats.tasks, icon: "✅" },
            { label: "Complaints", value: stats.complaints, icon: "📋" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white p-4 rounded-xl shadow text-center">
              <div className="text-2xl">{icon}</div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users by Role */}
      {stats?.byRole && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Users by Role</h3>
          <div className="flex gap-4">
            {stats.byRole.map(r => (
              <div key={r._id} className={`px-4 py-2 rounded-lg text-sm font-medium ${roleBadge[r._id] || "bg-gray-100"}`}>
                {r._id}: {r.count}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">User Management ({users.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{["Name", "Email", "Role", "Skills", "Joined", "Actions"].map(h => (
                <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-sm text-gray-500">{u.email}</td>
                  <td className="p-3">
                    {editUser === u._id ? (
                      <select defaultValue={u.role} onChange={e => updateUser(u._id, { role: e.target.value })}
                        className="text-xs border rounded p-1">
                        {["Admin", "Agent", "Customer"].map(r => <option key={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${roleBadge[u.role]}`}>{u.role}</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-gray-500">{u.skills?.join(", ") || "—"}</td>
                  <td className="p-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => setEditUser(editUser === u._id ? null : u._id)}
                      className="text-blue-600 hover:underline text-xs">
                      {editUser === u._id ? "Cancel" : "Edit Role"}
                    </button>
                    <button onClick={() => deleteUser(u._id, u.name)} className="text-red-500 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
