import { useState, useEffect } from "react";
import api from "../api/axios";

const empty = { title: "", description: "", status: "Pending", dueDate: "" };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/tasks").then(({ data }) => setTasks(data));
  useEffect(() => { load(); }, []);

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tasks</h2>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded">
          {showForm ? "Cancel" : "+ Add Task"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded grid grid-cols-2 gap-3">
          <input placeholder="Title" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} className="p-2 border rounded" />
          <input type="date" value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="p-2 border rounded" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="p-2 border rounded">
            {["Pending", "In Progress", "Done"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="col-span-2 bg-green-600 text-white px-4 py-2 rounded">
            {editId ? "Update" : "Add"}
          </button>
        </form>
      )}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>{["Title", "Description", "Due Date", "Status", "Actions"].map((h) => (
              <th key={h} className="p-3 text-left text-sm">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-400">No tasks yet</td></tr>
            ) : tasks.map((t) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{t.title}</td>
                <td className="p-3 text-gray-500">{t.description}</td>
                <td className="p-3">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    t.status === "Done" ? "bg-green-100 text-green-700" :
                    t.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                  }`}>{t.status}</span>
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
