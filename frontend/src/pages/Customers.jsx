import { useState, useEffect } from "react";
import api from "../api/axios";

const empty = { name: "", email: "", phone: "", company: "", status: "Active" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/customers").then(({ data }) => setCustomers(data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/customers/${editId}`, form);
    else await api.post("/customers", form);
    setForm(empty); setEditId(null); setShowForm(false); load();
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, status: c.status });
    setEditId(c._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this customer?")) { await api.delete(`/customers/${id}`); load(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Customers</h2>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded">
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded grid grid-cols-2 gap-3">
          {["name", "email", "phone", "company"].map((f) => (
            <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} required={f === "name" || f === "email"}
              value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              className="p-2 border rounded" />
          ))}
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="p-2 border rounded">
            {["Active", "Inactive", "At Risk"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded">
            {editId ? "Update" : "Add"}
          </button>
        </form>
      )}

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>{["Name", "Email", "Phone", "Company", "Status", "Actions"].map((h) => (
              <th key={h} className="p-3 text-left text-sm">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-400">No customers yet</td></tr>
            ) : customers.map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.company}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    c.status === "Active" ? "bg-green-100 text-green-700" :
                    c.status === "At Risk" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                  }`}>{c.status}</span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline text-sm">Edit</button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:underline text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
