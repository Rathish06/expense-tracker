import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SetBudget from '../pages/SetBudget';
import BudgetList from '../pages/BudgetList';
import EditBudget from '../pages/EditBudget';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const BudgetRoutes = () => {
    return (
        <Routes>
            <Route
                path="/set"
                element={
                    <ProtectedRoute>
                        <SetBudget />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/list"
                element={
                    <ProtectedRoute>
                        <BudgetList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/edit/:budgetId"
                element={
                    <ProtectedRoute>
                        <EditBudget />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default BudgetRoutes; 
import { Routes, Route } from 'react-router-dom';
import SetBudget from '../pages/SetBudget';
import BudgetList from '../pages/BudgetList';
import EditBudget from '../pages/EditBudget';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const BudgetRoutes = () => {
    return (
        <Routes>
            <Route
                path="/set"
                element={
                    <ProtectedRoute>
                        <SetBudget />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/list"
                element={
                    <ProtectedRoute>
                        <BudgetList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/edit/:budgetId"
                element={
                    <ProtectedRoute>
                        <EditBudget />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};

export default BudgetRoutes; 