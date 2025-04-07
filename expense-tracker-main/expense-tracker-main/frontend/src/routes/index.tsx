import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import AddExpense from '../pages/AddExpense';
import Reports from '../pages/Reports';
import Chatbot from '../pages/Chatbot';
import Budgets from '../pages/Budgets';
import Settings from '../pages/Settings';
import PrivateRoute from '../components/auth/PrivateRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<PrivateRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="add-expense" element={<AddExpense />} />
        <Route path="reports" element={<Reports />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 