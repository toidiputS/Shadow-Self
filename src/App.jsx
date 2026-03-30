import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import ShadowVault from './pages/ShadowVault';
import Guild from './pages/Guild';
import System from './pages/System';
import BottomNav from './components/BottomNav';

const queryClient = new QueryClient();

function App() {
  // Sync PWA theme-color with dynamic CSS variables
  useEffect(() => {
    const syncThemeColor = () => {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta && bgColor) {
        themeMeta.setAttribute('content', bgColor.trim());
      }
    };

    // Initial sync and observer for theme changes
    syncThemeColor();
    const observer = new MutationObserver(syncThemeColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-(--bg-color) transition-colors duration-400">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shadowvault" element={<ShadowVault />} />
            <Route path="/guild" element={<Guild />} />
            <Route path="/system" element={<System />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
