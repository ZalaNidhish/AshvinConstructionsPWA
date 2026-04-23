import React, { useState, useCallback } from 'react';
import Splash from './components/Splash.jsx';
import AppLock from './components/AppLock.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [params, setParams] = useState({});

  const navigate = useCallback((target, p = {}) => {
    setPage(target);
    setParams(p);
    window.scrollTo(0, 0);
  }, []);

  const isDetailPage = page === 'project-detail';

  // Show splash first
  if (!ready) return <Splash onDone={() => setReady(true)} />;

  // Show lock screen after splash
  if (!unlocked) return <AppLock onUnlock={() => setUnlocked(true)} />;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', overflow: 'hidden',
    }}>
      {/* Page content */}
      <div style={{ flex: 1, overflowY: isDetailPage ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
        {page === 'dashboard'      && <Dashboard onNavigate={navigate} />}
        {page === 'projects'       && <Projects  onNavigate={navigate} />}
        {page === 'project-detail' && <ProjectDetail params={params} onNavigate={navigate} />}
        {page === 'settings'       && <Settings />}
      </div>

      {/* Bottom nav - always visible */}
      <BottomNav
        active={['dashboard', 'projects', 'settings'].includes(page) ? page : 'projects'}
        onNavigate={navigate}
      />
    </div>
  );
}