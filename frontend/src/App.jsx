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
import Pipeline from "./pages/Pipeline";
import EmailComposer from "./pages/EmailComposer";
import Reminders from "./pages/Reminders";
import AdminPanel from "./pages/AdminPanel";
import Calendar from "./pages/Calendar";

function Layout({ dark, setDark, children }) {
  const location = useLocation();
  const isAuth = ["/login", "/register"].includes(location.pathname);
  if (isAuth) return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
      {children}
    </div>
  );
  return (
    <div className={`flex min-h-screen ${dark ? "bg-gray-800 text-white" : "bg-gray-100"}`}>
      <Sidebar dark={dark} setDark={setDark} />
      <main className="flex-1 p-6 overflow-auto max-w-full">{children}</main>
    </div>
  );
}

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  const [dark, setDark] = useState(false);
  return (
    <Router>
      <Layout dark={dark} setDark={setDark}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<P><Dashboard /></P>} />
          <Route path="/customers" element={<P><Customers /></P>} />
          <Route path="/leads" element={<P><Leads /></P>} />
          <Route path="/tasks" element={<P><Tasks /></P>} />
          <Route path="/profile" element={<P><Profile /></P>} />
          <Route path="/complaints" element={<P><Complaints /></P>} />
          <Route path="/portal" element={<P><CustomerPortal /></P>} />
          <Route path="/analytics" element={<P><Analytics /></P>} />
          <Route path="/settings" element={<P><Settings /></P>} />
          <Route path="/pipeline" element={<P><Pipeline /></P>} />
          <Route path="/email" element={<P><EmailComposer /></P>} />
          <Route path="/reminders" element={<P><Reminders /></P>} />
          <Route path="/admin" element={<P><AdminPanel /></P>} />
          <Route path="/calendar" element={<P><Calendar /></P>} />
        </Routes>
      </Layout>
    </Router>
  );
}
