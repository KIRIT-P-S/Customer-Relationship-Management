import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">AI CRM</Link>
      <div className="space-x-4 flex items-center">
        {user ? (
          <>
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/customers" className="hover:underline">Customers</Link>
            <Link to="/leads" className="hover:underline">Leads</Link>
            <Link to="/tasks" className="hover:underline">Tasks</Link>
            <Link to="/profile" className="hover:underline">{user.name}</Link>
            <button onClick={logout} className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-semibold">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
