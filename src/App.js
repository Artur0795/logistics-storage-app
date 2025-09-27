import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';

import HomePage from './components/HomePage';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import FileStorage from './components/FileStorage';
import './App.css';

const UserStorage = () => {
  const { userId } = useParams();
  return <Dashboard userId={userId} />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setIsAdmin={setIsAdmin} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/storage/:userId" element={<UserStorage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/files/:userId" element={<FileStorage isAdmin={isAdmin} />} />
          <Route path="/files/me" element={<FileStorage isAdmin={isAdmin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
