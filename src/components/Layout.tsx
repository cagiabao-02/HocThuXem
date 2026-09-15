import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <button
        className="sidebar-toggle-outer"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{
          left: sidebarCollapsed
            ? `calc(var(--sidebar-collapsed) - 14px)`
            : `calc(var(--sidebar-width) - 14px)`,
        }}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

