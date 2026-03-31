import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ShadowVault from './pages/ShadowVault';
import Guild from './pages/Guild';
import System from './pages/System';
import Auth from './pages/Auth';
import AdminPanel from './pages/admin/AdminPanel';
import SponsorPortal from './pages/sponsor/SponsorPortal';
import BottomNav from './components/BottomNav';
import DesktopNav from './components/DesktopNav';

const queryClient = new QueryClient();

const MasterLayout = ({ children }) => {
  const { session } = useAuth();
  return (
    <div className={`min-h-screen bg-(--bg-color) transition-colors duration-400 ${session ? 'pb-32 md:pb-0' : ''}`}>
      {children}
      {session && (
        <>
          <BottomNav />
          <DesktopNav />
        </>
      )}
    </div>
  );
};

function App() {
  useEffect(() => {
    const syncThemeColor = () => {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta && bgColor) {
        themeMeta.setAttribute('content', bgColor.trim());
      }
    };
    syncThemeColor();
    const observer = new MutationObserver(syncThemeColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <MasterLayout>
            <Routes>
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/admin/login" element={<Auth mode="admin-login" />} />
              <Route path="/request-access" element={<Auth mode="request-access" />} />
              <Route path="/request-access/status" element={<Auth mode="pending-status" />} />
              
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected Tactical Sectors */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['member', 'sponsor', 'leader', 'admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/guild" 
                element={
                  <ProtectedRoute allowedRoles={['member', 'sponsor', 'leader', 'admin']}>
                    <Guild />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/shadowvault" 
                element={
                  <ProtectedRoute allowedRoles={['member', 'sponsor', 'leader', 'admin']}>
                    <ShadowVault />
                  </ProtectedRoute>
                } 
              />

              {/* Persona-Specific Sectors */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sponsor" 
                element={
                  <ProtectedRoute allowedRoles={['sponsor', 'admin']}>
                    <SponsorPortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/system" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <System />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </MasterLayout>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
