import { useState, useEffect } from "react";
import api from "../api/axios";

const typeColors = { Task: "bg-yellow-100 text-yellow-700", "Follow-up": "bg-blue-100 text-blue-700", Meeting: "bg-purple-100 text-purple-700", Call: "bg-green-100 text-green-700", Other: "bg-gray-100 text-gray-600" };
const empty = { title: "", description: "", remindAt: "", type: "Follow-up", relatedTo: "" };

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/reminders").then(({ data }) => setReminders(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/reminders", form);
    setForm(empty); setShowForm(false); load();
  };

  const markRead = async (id) => { await api.put(`/reminders/${id}`, { isRead: true }); load(); };
  const del = async (id) => { await api.delete(`/reminders/${id}`); load(); };

  const isDue = (r) => !r.isRead && new Date(r.remindAt) <= new Date();
  const upcoming = reminders.filter(r => !r.isRead && new Date(r.remindAt) > new Date());
  const due = reminders.filter(r => isDue(r));
  const done = reminders.filter(r => r.isRead);

  const Section = ({ title, items, color }) => items.length === 0 ? null : (
    <div>
      <h3 className={`font-semibold text-sm mb-2 ${color}`}>{title} ({items.length})</h3>
      <div className="space-y-2">
        {items.map(r => (
          <div key={r._id} className={`bg-white rounded-xl p-4 shadow-sm flex justify-between items-start gap-3 ${isDue(r) ? "border-l-4 border-red-400" : ""}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[r.type]}`}>{r.type}</span>
                <p className="font-medium text-sm">{r.title}</p>
                {isDue(r) && <span className="text-xs text-red-500 font-bold">DUE NOW</span>}
              </div>
              {r.description && <p className="text-xs text-gray-500 mt-1">{r.description}</p>}
              {r.relatedTo && <p className="text-xs text-gray-400 mt-1">Related: {r.relatedTo}</p>}
              <p className="text-xs text-gray-400 mt-1">🕐 {new Date(r.remindAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!r.isRead && <button onClick={() => markRead(r._id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✓ Done</button>}
              <button onClick={() => del(r._id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Reminders</h2>
          {due.length > 0 && <p className="text-sm text-red-500 font-medium">⚠️ {due.length} reminder{due.length > 1 ? "s" : ""} due now!</p>}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          {showForm ? "Cancel" : "+ Add Reminder"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded-xl grid grid-cols-2 gap-3">
          <input placeholder="Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="p-2 border rounded" />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="p-2 border rounded">
            {["Task", "Follow-up", "Meeting", "Call", "Other"].map(t => <option key={t}>{t}</option>)}
          </select>
          <input type="datetime-local" required value={form.remindAt} onChange={e => setForm({ ...form, remindAt: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Related to (customer/lead name)" value={form.relatedTo} onChange={e => setForm({ ...form, relatedTo: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="col-span-2 p-2 border rounded" />
          <button className="col-span-2 bg-green-600 text-white py-2 rounded">Set Reminder</button>
        </form>
      )}

      <Section title="⚠️ Due Now" items={due} color="text-red-600" />
      <Section title="📅 Upcoming" items={upcoming} color="text-blue-600" />
      <Section title="✅ Completed" items={done} color="text-gray-400" />
      {reminders.length === 0 && <div className="bg-white p-8 rounded-xl shadow text-center text-gray-400">No reminders yet. Add one to stay on top of follow-ups!</div>}
    </div>
  );
}
