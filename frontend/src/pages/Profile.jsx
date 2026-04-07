import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState({ name: "", email: "", phone: "", role: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setUser(data)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/me", { name: user.name, phone: user.phone });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setMsg("Profile updated!");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Update failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {msg && <p className="mb-3 text-green-600">{msg}</p>}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input value={user.email} disabled className="w-full p-2 border bg-gray-100 rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Phone</label>
          <input value={user.phone || ""} onChange={(e) => setUser({ ...user, phone: e.target.value })}
            className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Role</label>
          <input value={user.role} disabled className="w-full p-2 border bg-gray-100 rounded" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Save Changes</button>
      </form>
    </div>
  );
}
