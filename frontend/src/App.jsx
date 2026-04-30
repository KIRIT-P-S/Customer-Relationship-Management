import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Customers from "./pages/Customers";
import Leads from "./pages/Leads";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Complaints from "./pages/Complaints";
import CustomerPortal from "./pages/CustomerPortal";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

function Layout({ dark, setDark, children }) {
  const location = useLocation();
  const isAuth = ["/login", "/register"].includes(location.pathname);
  if (isAuth) return <div className={dark ? "dark bg-gray-900 min-h-screen" : ""}>{children}</div>;
  return (
    <div className={`flex min-h-screen ${dark ? "bg-gray-800 text-white" : "bg-gray-100"}`}>
      <Sidebar dark={dark} setDark={setDark} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}

export default function App() {
  const [dark, setDark] = useState(false);
  return (
    <Router>
      <Layout dark={dark} setDark={setDark}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
          <Route path="/portal" element={<ProtectedRoute><CustomerPortal /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}
