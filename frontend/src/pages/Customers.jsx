import { useState, useEffect } from "react";
import api from "../api/axios";

const empty = { name: "", email: "", phone: "", company: "", status: "Active" };
const statusBadge = { Active: "bg-green-100 text-green-700", Inactive: "bg-gray-100 text-gray-600", "At Risk": "bg-red-100 text-red-700" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");

  const load = () => api.get(`/customers?search=${search}&status=${statusFilter}`).then(({ data }) => setCustomers(data));
  useEffect(() => { load(); }, [search, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/customers/${editId}`, form);
    else await api.post("/customers", form);
    setForm(empty); setEditId(null); setShowForm(false); load();
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, status: c.status });
    setEditId(c._id); setShowForm(true); setSelected(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this customer?")) { await api.delete(`/customers/${id}`); load(); if (selected?._id === id) setSelected(null); }
  };

  const openNotes = async (c) => {
    setSelected(c);
    const { data } = await api.get(`/notes?customer=${c._id}`);
    setNotes(data);
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    await api.post("/notes", { content: noteText, customer: selected._id });
    setNoteText("");
    const { data } = await api.get(`/notes?customer=${selected._id}`);
    setNotes(data);
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Phone", "Company", "Status"], ...customers.map(c => [c.name, c.email, c.phone, c.company, c.status])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv," + encodeURIComponent(csv); a.download = "customers.csv"; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold">Customers <span className="text-sm text-gray-400 font-normal">({customers.length})</span></h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCSV} className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">⬇ Export CSV</button>
          <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); setSelected(null); }}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            {showForm ? "Cancel" : "+ Add Customer"}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 Search name, email, company..."
          className="flex-1 min-w-48 p-2 border rounded text-sm" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border rounded text-sm">
          <option value="">All Status</option>
          {["Active", "Inactive", "At Risk"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded grid grid-cols-2 gap-3">
          {["name", "email", "phone", "company"].map((f) => (
            <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} required={f === "name" || f === "email"}
              value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="p-2 border rounded" />
          ))}
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="p-2 border rounded">
            {["Active", "Inactive", "At Risk"].map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded">{editId ? "Update" : "Add"}</button>
        </form>
      )}

      <div className="flex gap-4">
        {/* Table */}
        <div className="flex-1 bg-white shadow rounded overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{["Name", "Email", "Phone", "Company", "Status", "Actions"].map(h => (
                <th key={h} className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No customers found</td></tr>
              ) : customers.map((c) => (
                <tr key={c._id} className={`border-t hover:bg-gray-50 cursor-pointer ${selected?._id === c._id ? "bg-blue-50" : ""}`}
                  onClick={() => openNotes(c)}>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-sm text-gray-500">{c.email}</td>
                  <td className="p-3 text-sm">{c.phone}</td>
                  <td className="p-3 text-sm">{c.company}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${statusBadge[c.status]}`}>{c.status}</span></td>
                  <td className="p-3 space-x-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes Panel */}
        {selected && (
          <div className="w-72 bg-white shadow rounded p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">Notes — {selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto max-h-64 mb-3">
              {notes.length === 0 ? <p className="text-xs text-gray-400">No notes yet</p> :
                notes.map(n => (
                  <div key={n._id} className="bg-gray-50 rounded p-2">
                    <p className="text-xs">{n.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.createdBy?.name} · {new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add note..."
                className="flex-1 p-2 border rounded text-xs" onKeyDown={e => e.key === "Enter" && addNote()} />
              <button onClick={addNote} className="bg-blue-600 text-white px-3 rounded text-xs">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
