import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}
      <input
        type="email" placeholder="Email" required
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password" placeholder="Password" required
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="bg-blue-600 text-white px-4 py-2 w-full rounded">Login</button>
      <p className="mt-3 text-center text-sm">
        No account? <Link to="/register" className="text-blue-600">Register</Link>
      </p>
    </form>
  );
}
