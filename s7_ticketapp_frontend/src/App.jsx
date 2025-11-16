// src/App.jsx
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import AdminGuard from "./components/Student/AdminGuard";
import AdminPage from "./routers/AdminPage/AdminPage";
import { GuestOnly, RequireAuth } from "./routers/guards";
import Login from "./routers/Login/Login";
import TicketHomePage from "./routers/Student/TicketHomePage";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Guests only */}
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
        </Route>


<Route element={<RequireAuth />}>
  <Route path="/home" element={<TicketHomePage />} />
</Route>

// App.jsx
<Route
  path="/admin"
  element={
    <AdminGuard>
      <AdminPage />
    </AdminGuard>
  }
/>


        {/* Defaults */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}
