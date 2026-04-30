import { useState, useEffect } from "react";
import api from "../api/axios";

export default function Settings() {
  const [user, setUser] = useState({ name: "", email: "", phone: "", skills: [], expertise: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [tab, setTab] = useState("profile");

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setUser({ ...data, skills: data.skills || [] })).catch(() => {});
  }, []);

  const notify = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3000); };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/me", { name: user.name, phone: user.phone, skills: user.skills, expertise: user.expertise });
      localStorage.setItem("user", JSON.stringify(data));
      notify("Profile updated successfully!");
    } catch { notify("Update failed", "error"); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) return notify("Passwords don't match", "error");
    if (passwords.newPass.length < 6) return notify("Password must be at least 6 characters", "error");
    notify("Password change coming soon — backend endpoint needed");
  };

  const tabs = ["profile", "security", "preferences"];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Settings</h2>

      {msg.text && (
        <div className={`p-3 rounded text-sm ${msg.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize ${tab === t ? "border-b-2 border-blue-600 text-blue-600 font-semibold" : "text-gray-500"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <form onSubmit={saveProfile} className="bg-white shadow rounded p-6 space-y-4">
          <h3 className="font-semibold">Profile Information</h3>
          {[
            { label: "Full Name", key: "name", type: "text" },
            { label: "Phone", key: "phone", type: "text" },
            { label: "Expertise", key: "expertise", type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input type={type} value={user[key] || ""} onChange={(e) => setUser({ ...user, [key]: e.target.value })}
                className="w-full p-2 border rounded" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Email (cannot change)</label>
            <input value={user.email} disabled className="w-full p-2 border rounded bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input value={user.role} disabled className="w-full p-2 border rounded bg-gray-100" />
          </div>
          {user.role === "Agent" && (
            <div>
              <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
              <input value={user.skills?.join(", ") || ""} onChange={(e) => setUser({ ...user, skills: e.target.value.split(",").map(s => s.trim()) })}
                className="w-full p-2 border rounded" placeholder="billing, technical, sales" />
            </div>
          )}
          <button className="bg-blue-600 text-white px-6 py-2 rounded w-full">Save Profile</button>
        </form>
      )}

      {tab === "security" && (
        <form onSubmit={changePassword} className="bg-white shadow rounded p-6 space-y-4">
          <h3 className="font-semibold">Change Password</h3>
          {[
            { label: "Current Password", key: "current" },
            { label: "New Password", key: "newPass" },
            { label: "Confirm New Password", key: "confirm" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input type="password" value={passwords[key]} onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                className="w-full p-2 border rounded" />
            </div>
          ))}
          <button className="bg-blue-600 text-white px-6 py-2 rounded w-full">Update Password</button>
        </form>
      )}

      {tab === "preferences" && (
        <div className="bg-white shadow rounded p-6 space-y-4">
          <h3 className="font-semibold">Preferences</h3>
          <div className="space-y-3">
            {[
              "Email notifications for new leads",
              "Email notifications for task due dates",
              "Email notifications for complaints",
              "Weekly summary report",
            ].map((pref) => (
              <label key={pref} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                <span className="text-sm">{pref}</span>
              </label>
            ))}
          </div>
          <button className="bg-blue-600 text-white px-6 py-2 rounded w-full">Save Preferences</button>
        </div>
      )}
    </div>
  );
}
