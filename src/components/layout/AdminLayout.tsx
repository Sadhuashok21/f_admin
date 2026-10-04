import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const location = useLocation();
  const { user, isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login(location.pathname + location.search + location.hash);
    }
  }, [isLoading, isAuthenticated, login, location]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatically close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--text-main)' }}>
        {isLoading ? 'Checking your session…' : 'Redirecting to secure sign in…'}
      </div>
    );
  }

  if (user && user.role !== 'Administrator') {
    return <Navigate to="/access-restricted" replace />;
  }

  return (
    <div className="app-container">
      <TopNav onToggleSidebar={toggleSidebar} />
      <Sidebar collapsed={sidebarCollapsed} onCloseMobile={() => setSidebarCollapsed(true)} />
      {/* Mobile Backdrop Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarCollapsed(true)}
          aria-label="Close Sidebar Backdrop"
        />
      )}
      <main className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
