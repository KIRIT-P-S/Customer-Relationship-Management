import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Customer", skills: "", expertise: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(",").map(s => s.trim().toLowerCase()) : [],
      };
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}

      <input placeholder="Name" required className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input type="email" placeholder="Email" required className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" required className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setForm({ ...form, password: e.target.value })} />

      <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="w-full mb-3 p-2 border rounded">
        <option value="Customer">Customer</option>
        <option value="Agent">Agent</option>
        <option value="Admin">Admin</option>
      </select>

      {form.role === "Agent" && (
        <>
          <input placeholder="Skills (comma separated: billing, technical, sales)"
            className="w-full mb-3 p-2 border rounded"
            onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <input placeholder="Expertise description"
            className="w-full mb-3 p-2 border rounded"
            onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
        </>
      )}

      <button className="bg-green-600 text-white px-4 py-2 w-full rounded">Register</button>
      <p className="mt-3 text-center text-sm">
        Have an account? <Link to="/login" className="text-blue-600">Login</Link>
      </p>
    </form>
  );
}
