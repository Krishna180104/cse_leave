import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Approvals from "./pages/Approvals";
import LeaveApplicationForm from "./pages/LeaveApplicationForm";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/leave-application" element={<LeaveApplicationForm />} />
        <Route path="/dashboard/approvals" element={<Approvals />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
