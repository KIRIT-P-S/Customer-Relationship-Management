import { useState, useEffect } from "react";
import api from "../api/axios";

const STAGES = ["Prospecting", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const stageColors = {
  Prospecting: "border-gray-400 bg-gray-50",
  Proposal: "border-blue-400 bg-blue-50",
  Negotiation: "border-yellow-400 bg-yellow-50",
  "Closed Won": "border-green-400 bg-green-50",
  "Closed Lost": "border-red-400 bg-red-50",
};
const stageBadge = {
  Prospecting: "bg-gray-100 text-gray-700",
  Proposal: "bg-blue-100 text-blue-700",
  Negotiation: "bg-yellow-100 text-yellow-700",
  "Closed Won": "bg-green-100 text-green-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

const empty = { title: "", value: "", stage: "Prospecting", expectedClose: "", probability: 20, notes: "" };

export default function Pipeline() {
  const [deals, setDeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [dragging, setDragging] = useState(null);

  const load = () => api.get("/deals").then(({ data }) => setDeals(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await api.put(`/deals/${editId}`, form);
    else await api.post("/deals", form);
    setForm(empty); setEditId(null); setShowForm(false); load();
  };

  const handleEdit = (d) => {
    setForm({ title: d.title, value: d.value, stage: d.stage, expectedClose: d.expectedClose?.slice(0, 10) || "", probability: d.probability, notes: d.notes });
    setEditId(d._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this deal?")) { await api.delete(`/deals/${id}`); load(); }
  };

  const moveStage = async (id, stage) => {
    await api.put(`/deals/${id}`, { stage });
    load();
  };

  const totalValue = deals.filter(d => d.stage === "Closed Won").reduce((s, d) => s + d.value, 0);
  const pipeline = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage)).reduce((s, d) => s + d.value * (d.probability / 100), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold">Sales Pipeline</h2>
          <p className="text-sm text-gray-500">Won: <span className="text-green-600 font-semibold">${totalValue.toLocaleString()}</span> · Pipeline: <span className="text-blue-600 font-semibold">${Math.round(pipeline).toLocaleString()}</span></p>
        </div>
        <button onClick={() => { setForm(empty); setEditId(null); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
          {showForm ? "Cancel" : "+ Add Deal"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded grid grid-cols-2 md:grid-cols-3 gap-3">
          <input placeholder="Deal Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="p-2 border rounded" />
          <input type="number" placeholder="Value ($)" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="p-2 border rounded" />
          <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="p-2 border rounded">
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="date" value={form.expectedClose} onChange={e => setForm({ ...form, expectedClose: e.target.value })} className="p-2 border rounded" />
          <input type="number" placeholder="Probability %" min="0" max="100" value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} className="p-2 border rounded" />
          <input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="p-2 border rounded" />
          <button className="col-span-2 md:col-span-3 bg-green-600 text-white py-2 rounded">{editId ? "Update Deal" : "Add Deal"}</button>
        </form>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage}
              className={`min-w-56 flex-shrink-0 rounded-xl border-2 ${stageColors[stage]} p-3`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => { if (dragging) { moveStage(dragging, stage); setDragging(null); } }}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm">{stage}</h3>
                <span className="text-xs text-gray-500">{stageDeals.length} · ${stageTotal.toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                {stageDeals.map(d => (
                  <div key={d._id} draggable
                    onDragStart={() => setDragging(d._id)}
                    className="bg-white rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing border border-gray-100 hover:shadow-md transition-shadow">
                    <p className="font-medium text-sm">{d.title}</p>
                    <p className="text-green-600 font-bold text-sm">${d.value?.toLocaleString()}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">{d.probability}% likely</span>
                      {d.expectedClose && <span className="text-xs text-gray-400">{new Date(d.expectedClose).toLocaleDateString()}</span>}
                    </div>
                    {d.notes && <p className="text-xs text-gray-400 mt-1 truncate">{d.notes}</p>}
                    <div className="flex gap-2 mt-2">
                      <select value={d.stage} onChange={e => moveStage(d._id, e.target.value)} className="text-xs border rounded p-0.5 flex-1">
                        {STAGES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button onClick={() => handleEdit(d)} className="text-blue-500 text-xs">✏️</button>
                      <button onClick={() => handleDelete(d._id)} className="text-red-400 text-xs">🗑️</button>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Drop deals here</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
