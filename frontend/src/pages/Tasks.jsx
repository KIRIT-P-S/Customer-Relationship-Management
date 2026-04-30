import { useState, useEffect } from "react";
import api from "../api/axios";

const empty = { title: "", description: "", status: "Pending", dueDate: "" };
const statusBadge = { Pending: "bg-yellow-100 text-yellow-700", "In Progress": "bg-blue-100 text-blue-700", Done: "bg-green-100 text-green-700" };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => api.get(`/tasks?search=${search}&status=${statusFilter}`).then(({ data }) => setTasks(data));
  useEffect(() => { load(); }, [search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/tasks/${editId}`, form);
    else await api.post("/tasks", form);
    setForm(empty); setEditId(null); setShowForm(false); load();
  };

  const handleEdit = (t) => {
    setForm({ title: t.title, description: t.description, status: t.status, dueDate: t.dueDate?.slice(0, 10) || "" });
    setEditId(t._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this task?")) { await api.delete(`/tasks/${id}`); load(); }
  };

  const quickStatus = async (id, status) => { await api.put(`/tasks/${id}`, { status }); load(); };

  const isOverdue = (t) => t.dueDate && t.status !== "Done" && new Date(t.dueDate) < new Date();

  const exportCSV = () => {
    const rows = [["Title", "Description", "Status", "Due Date"], ...tasks.map(t => [t.title, t.description, t.status, t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ""])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "tasks.csv"; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold">Tasks <span className="text-sm text-gray-400 font-normal">({tasks.length})</span></h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">⬇ Export CSV</button>
          <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            {showForm ? "Cancel" : "+ Add Task"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {["Pending", "In Progress", "Done"].map(s => (
          <div key={s} className={`p-3 rounded-lg text-center cursor-pointer border-2 ${statusFilter === s ? "border-blue-500" : "border-transparent"} ${statusBadge[s]}`}
            onClick={() => setStatusFilter(statusFilter === s ? "" : s)}>
            <p className="text-lg font-bold">{tasks.filter(t => t.status === s).length}</p>
            <p className="text-xs">{s}</p>
          </div>
        ))}
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search tasks..."
        className="w-full p-2 border rounded text-sm" />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded grid grid-cols-2 gap-3">
          <input placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="p-2 border rounded" />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="p-2 border rounded" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="p-2 border rounded">
            {["Pending", "In Progress", "Done"].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="col-span-2 bg-green-600 text-white px-4 py-2 rounded">{editId ? "Update" : "Add"}</button>
        </form>
      )}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>{["Title", "Description", "Due Date", "Status", "Quick Update", "Actions"].map(h => (
              <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No tasks found</td></tr>
            ) : tasks.map((t) => (
              <tr key={t._id} className={`border-t hover:bg-gray-50 ${isOverdue(t) ? "bg-red-50" : ""}`}>
                <td className="p-3 font-medium">
                  {t.title}
                  {isOverdue(t) && <span className="ml-2 text-xs text-red-500 font-semibold">OVERDUE</span>}
                </td>
                <td className="p-3 text-sm text-gray-500">{t.description}</td>
                <td className="p-3 text-sm">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[t.status]}`}>{t.status}</span></td>
                <td className="p-3">
                  <select value={t.status} onChange={(e) => quickStatus(t._id, e.target.value)} className="text-xs border rounded p-1">
                    {["Pending", "In Progress", "Done"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => handleEdit(t)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
