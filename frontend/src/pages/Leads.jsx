import { useState, useEffect } from "react";
import api from "../api/axios";

const empty = { name: "", email: "", phone: "", source: "Manual", status: "New" };
const statusBadge = { New: "bg-gray-100 text-gray-600", Contacted: "bg-blue-100 text-blue-700", Qualified: "bg-green-100 text-green-700", Lost: "bg-red-100 text-red-700" };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = () => api.get(`/leads?search=${search}&status=${statusFilter}`).then(({ data }) => setLeads(data));
  useEffect(() => { load(); }, [search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/leads/${editId}`, form);
    else await api.post("/leads", form);
    setForm(empty); setEditId(null); setShowForm(false); load();
  };

  const handleEdit = (l) => {
    setForm({ name: l.name, email: l.email, phone: l.phone, source: l.source, status: l.status });
    setEditId(l._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this lead?")) { await api.delete(`/leads/${id}`); load(); }
  };

  const quickStatus = async (id, status) => {
    await api.put(`/leads/${id}`, { status }); load();
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Phone", "Source", "Status"], ...leads.map(l => [l.name, l.email, l.phone, l.source, l.status])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "leads.csv"; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold">Leads <span className="text-sm text-gray-400 font-normal">({leads.length})</span></h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">⬇ Export CSV</button>
          <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            {showForm ? "Cancel" : "+ Add Lead"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {["New", "Contacted", "Qualified", "Lost"].map(s => (
          <div key={s} className={`p-3 rounded-lg text-center cursor-pointer border-2 ${statusFilter === s ? "border-blue-500" : "border-transparent"} ${statusBadge[s]}`}
            onClick={() => setStatusFilter(statusFilter === s ? "" : s)}>
            <p className="text-lg font-bold">{leads.filter(l => l.status === s).length}</p>
            <p className="text-xs">{s}</p>
          </div>
        ))}
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search leads..."
        className="w-full p-2 border rounded text-sm" />

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded grid grid-cols-2 gap-3">
          {["name", "email", "phone", "source"].map((f) => (
            <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} required={f === "name" || f === "email"}
              value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="p-2 border rounded" />
          ))}
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="p-2 border rounded">
            {["New", "Contacted", "Qualified", "Lost"].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded">{editId ? "Update" : "Add"}</button>
        </form>
      )}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>{["Name", "Email", "Phone", "Source", "Status", "Quick Update", "Actions"].map(h => (
              <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">No leads found</td></tr>
            ) : leads.map((l) => (
              <tr key={l._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{l.name}</td>
                <td className="p-3 text-sm text-gray-500">{l.email}</td>
                <td className="p-3 text-sm">{l.phone}</td>
                <td className="p-3 text-sm">{l.source}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[l.status]}`}>{l.status}</span></td>
                <td className="p-3">
                  <select value={l.status} onChange={(e) => quickStatus(l._id, e.target.value)} className="text-xs border rounded p-1">
                    {["New", "Contacted", "Qualified", "Lost"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => handleEdit(l)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(l._id)} className="text-red-500 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
