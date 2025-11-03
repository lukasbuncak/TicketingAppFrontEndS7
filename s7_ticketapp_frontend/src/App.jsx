// src/App.jsx
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";

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

        {/* Auth required */}
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<TicketHomePage />} />
          <Route path="/admin" element={<AdminPage />} /> {/* might need separate RequireAuth. Reason: Azure JWT which is seperate, therefore,
                                                           I confirm and validate it directly with azure if possible */}
        </Route>

        {/* Default route: send to the right place */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}
