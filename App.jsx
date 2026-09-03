import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LangProvider } from '@/lib/i18n';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/coach/Dashboard';
import Athletes from '@/pages/coach/Athletes';
import Plans from '@/pages/coach/Plans';
import Payments from '@/pages/coach/Payments';
import RunnerHome from '@/pages/runner/RunnerHome';
import CheckIn from '@/pages/runner/CheckIn';
import AthleteDashboard from '@/pages/athlete/AthleteDashboard';
import StoreFront from '@/pages/store/StoreFront';
import StoreManager from '@/pages/coach/StoreManager';
import Settings from '@/pages/Settings';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Add page imports here

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <AnimatePresence mode="wait">
    <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ minHeight: "100%" }}>
    <Routes location={location}>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/atletas" element={<Athletes />} />
          <Route path="/planes" element={<Plans />} />
          <Route path="/pagos" element={<Payments />} />
          <Route path="/tienda-admin" element={<StoreManager />} />
        </Route>
        <Route path="/runner/:athleteId" element={<RunnerHome />} />
        <Route path="/runner/:athleteId/check-in" element={<CheckIn />} />
        <Route path="/atleta" element={<AthleteDashboard />} />
        <Route path="/tienda" element={<StoreFront />} />
        <Route path="/tienda/:productId" element={<StoreFront />} />
        <Route path="/ajustes" element={<Settings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </motion.div>
    </AnimatePresence>
  );
};


function App() {
  // System dark mode sync
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (e) => document.documentElement.classList.toggle("dark", e.matches);
    apply(mq);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <LangProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
    </LangProvider>
  )
}

export default App