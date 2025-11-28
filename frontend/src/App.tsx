import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './auth/AuthStore';
import RequireAuth from './auth/RequireAuth';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import Dashboard from './pages/Dashboard';

// Lazy load other pages
const Users = lazy(() => import('./pages/Users'));
const Employees = lazy(() => import('./pages/Employees'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Leaves = lazy(() => import('./pages/Leaves'));
const Payroll = lazy(() => import('./pages/Payroll'));
const Documents = lazy(() => import('./pages/Documents'));
const Settings = lazy(() => import('./pages/Settings'));

const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
);

function App() {
    const { isAuthenticated, loadUser } = useAuthStore();

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterCompany />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8 relative">


                    <div className="relative z-10 max-w-7xl mx-auto">
                        <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                                <Route path="/users" element={<RequireAuth allowedRoles={['admin', 'rh']}><Users /></RequireAuth>} />
                                <Route path="/employees" element={<RequireAuth allowedRoles={['admin', 'rh']}><Employees /></RequireAuth>} />
                                <Route path="/attendance" element={<RequireAuth allowedRoles={['admin', 'rh', 'manager']}><Attendance /></RequireAuth>} />
                                <Route path="/leaves" element={<RequireAuth><Leaves /></RequireAuth>} />
                                <Route path="/payroll" element={<RequireAuth allowedRoles={['admin', 'rh']}><Payroll /></RequireAuth>} />
                                <Route path="/documents" element={<RequireAuth allowedRoles={['admin', 'rh', 'manager']}><Documents /></RequireAuth>} />
                                <Route path="/settings" element={<RequireAuth allowedRoles={['admin']}><Settings /></RequireAuth>} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </Suspense>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
