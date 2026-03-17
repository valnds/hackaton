import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from '../pages/Welcome';
import Home from '../pages/Home';

function ProtectedRoute({ children }) {
  const isAuthorized = localStorage.getItem('authorized') === 'true';
  return isAuthorized ? children : <Navigate to="/" />;
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/menu" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

