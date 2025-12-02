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
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LegalMentions from './pages/LegalMentions';
import Security from './pages/Security';
import { SidebarProvider } from './context/SidebarContext';
import UpgradeModal from './components/UpgradeModal';

// Lazy load other pages
const Users = lazy(() => import('./pages/Users'));
const Employees = lazy(() => import('./pages/Employees'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Leaves = lazy(() => import('./pages/Leaves'));
const Payroll = lazy(() => import('./pages/Payroll'));
const Documents = lazy(() => import('./pages/Documents'));
const Settings = lazy(() => import('./pages/Settings'));

// Lazy load SaaS Owner pages
const SaasAdmin = lazy(() => import('./pages/SaasAdmin'));
const SaasDashboard = lazy(() => import('./pages/SaasDashboard'));
const SaasBilling = lazy(() => import('./pages/SaasBilling'));
const SaasAnalytics = lazy(() => import('./pages/SaasAnalytics'));
const SaasMonitoring = lazy(() => import('./pages/SaasMonitoring'));
const SaasLogs = lazy(() => import('./pages/SaasLogs'));
const SaasConfig = lazy(() => import('./pages/SaasConfig'));
const SaasCompanies = lazy(() => import('./pages/SaasCompanies'));
const SaasSubscriptionManager = lazy(() => import('./pages/SaasSubscriptionManager'));

// SaaS Billing Pages
const SaasBillingDashboard = lazy(() => import('./pages/SaasBillingDashboard'));
const SaasBillingConfig = lazy(() => import('./pages/SaasBillingConfig'));
const SaasBillingPlans = lazy(() => import('./pages/SaasBillingPlans'));
const SaasBillingSubscriptions = lazy(() => import('./pages/SaasBillingSubscriptions'));
const SaasBillingTransactions = lazy(() => import('./pages/SaasBillingTransactions'));
const SaasBillingInvoices = lazy(() => import('./pages/SaasBillingInvoices'));
const SaasBillingPromoCodes = lazy(() => import('./pages/SaasBillingPromoCodes'));

// Billing Pages
const PricingPage = lazy(() => import('./pages/PricingPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const SubscriptionDashboard = lazy(() => import('./pages/SubscriptionDashboard'));

const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
);

function App() {
    const { isAuthenticated, loadUser, user } = useAuthStore();

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterCompany />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/legal" element={<LegalMentions />} />
                <Route path="/security" element={<Security />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    // Déterminer la page par défaut selon le rôle
    const defaultRoute = user?.role === 'owner' ? '/saas' : '/dashboard';

    return (
        <>
            {/* Upgrade Modal for trial users */}
            <UpgradeModal />

            <Routes>
                {/* Standalone pages (no sidebar/navbar) */}
                <Route path="/pricing" element={
                    <Suspense fallback={<LoadingFallback />}>
                        <RequireAuth allowedRoles={['admin', 'owner']}>
                            <PricingPage />
                        </RequireAuth>
                    </Suspense>
                } />
                <Route path="/checkout" element={
                    <Suspense fallback={<LoadingFallback />}>
                        <RequireAuth allowedRoles={['admin', 'owner']}>
                            <CheckoutPage />
                        </RequireAuth>
                    </Suspense>
                } />

                {/* Main app with sidebar */}
                <Route path="/*" element={
                    <SidebarProvider>
                        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans">
                            <Sidebar />
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <Navbar />
                                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                                    <div className="relative z-10 max-w-7xl mx-auto">
                                        <Suspense fallback={<LoadingFallback />}>
                                            <Routes>
                                                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />

                                                {/* SaaS Owner Routes */}
                                                <Route path="/saas" element={<RequireAuth allowedRoles={['owner']}><SaasAdmin /></RequireAuth>} />
                                                <Route path="/saas/dashboard" element={<RequireAuth allowedRoles={['owner']}><SaasDashboard /></RequireAuth>} />
                                                <Route path="/saas/analytics" element={<RequireAuth allowedRoles={['owner']}><SaasAnalytics /></RequireAuth>} />
                                                <Route path="/saas/monitoring" element={<RequireAuth allowedRoles={['owner']}><SaasMonitoring /></RequireAuth>} />
                                                <Route path="/saas/logs" element={<RequireAuth allowedRoles={['owner']}><SaasLogs /></RequireAuth>} />
                                                <Route path="/saas/config" element={<RequireAuth allowedRoles={['owner']}><SaasConfig /></RequireAuth>} />
                                                <Route path="/saas/companies" element={<RequireAuth allowedRoles={['owner']}><SaasCompanies /></RequireAuth>} />
                                                <Route path="/saas/subscriptions-manager" element={<RequireAuth allowedRoles={['owner']}><SaasSubscriptionManager /></RequireAuth>} />

                                                {/* SaaS Billing Routes */}
                                                <Route path="/saas/billing" element={<RequireAuth allowedRoles={['owner']}><SaasBillingDashboard /></RequireAuth>} />
                                                <Route path="/saas/billing/config" element={<RequireAuth allowedRoles={['owner']}><SaasBillingConfig /></RequireAuth>} />
                                                <Route path="/saas/billing/plans" element={<RequireAuth allowedRoles={['owner']}><SaasBillingPlans /></RequireAuth>} />
                                                <Route path="/saas/billing/subscriptions" element={<RequireAuth allowedRoles={['owner']}><SaasBillingSubscriptions /></RequireAuth>} />
                                                <Route path="/saas/billing/transactions" element={<RequireAuth allowedRoles={['owner']}><SaasBillingTransactions /></RequireAuth>} />
                                                <Route path="/saas/billing/invoices" element={<RequireAuth allowedRoles={['owner']}><SaasBillingInvoices /></RequireAuth>} />
                                                <Route path="/saas/billing/promo-codes" element={<RequireAuth allowedRoles={['owner']}><SaasBillingPromoCodes /></RequireAuth>} />

                                                <Route path="/users" element={<RequireAuth allowedRoles={['admin', 'rh', 'owner']}><Users /></RequireAuth>} />
                                                <Route path="/employees" element={<RequireAuth allowedRoles={['admin', 'rh']}><Employees /></RequireAuth>} />
                                                <Route path="/attendance" element={<RequireAuth><Attendance /></RequireAuth>} />
                                                <Route path="/leaves" element={<RequireAuth><Leaves /></RequireAuth>} />
                                                <Route path="/payroll" element={<RequireAuth allowedRoles={['admin', 'rh']}><Payroll /></RequireAuth>} />
                                                <Route path="/documents" element={<RequireAuth allowedRoles={['admin', 'rh', 'manager']}><Documents /></RequireAuth>} />
                                                <Route path="/settings" element={<RequireAuth allowedRoles={['admin']}><Settings /></RequireAuth>} />

                                                {/* Subscription Dashboard (inside layout) */}
                                                <Route path="/subscription" element={<RequireAuth allowedRoles={['admin', 'owner']}><SubscriptionDashboard /></RequireAuth>} />

                                                <Route path="*" element={<Navigate to={defaultRoute} replace />} />
                                            </Routes>
                                        </Suspense>
                                    </div>
                                </main>
                            </div>
                        </div>
                    </SidebarProvider>
                } />
            </Routes>
        </>
    );
}

export default App;
