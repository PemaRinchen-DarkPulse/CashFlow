import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <React.Fragment>
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Catch-all route for 404 errors */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </React.Fragment>
  );
}

export default App;
