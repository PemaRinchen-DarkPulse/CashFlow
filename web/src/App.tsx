import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login/Login';
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import LessonPlans from './pages/LessonPlans/LessonPlans';
import Students from './pages/Students/Students';
import ManageUsers from './pages/ManageUsers/ManageUsers';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lesson-plans" element={<LessonPlans />} />
        <Route path="/students" element={<Students />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
