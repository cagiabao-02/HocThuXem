import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Trophy,
  User,
  LogOut,
  Globe,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { getAvailableLanguages } from '../lib/i18n';
import XPBar from './XPBar';
import StreakBadge from './StreakBadge';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/documents', icon: FileText, label: t('nav.documents') },
    { to: '/lessons', icon: BookOpen, label: t('nav.lessons') },
    { to: '/leaderboard', icon: Trophy, label: t('nav.leaderboard') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleLang = () => {
    const langs = getAvailableLanguages();
    const currentIdx = langs.findIndex((l) => l.code === lang);
    const nextIdx = (currentIdx + 1) % langs.length;
    setLang(langs[nextIdx].code);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <GraduationCap size={28} />
        </div>
        {!collapsed && <span className="sidebar-logo-text">HocThuXem</span>}
      </div>

      {/* User info */}
      {profile && !collapsed && (
        <div className="sidebar-user">
          <div className="avatar">
            {profile.display_name?.[0]?.toUpperCase() || profile.username[0]?.toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{profile.display_name || profile.username}</span>
            <span className="sidebar-user-level">Lv.{profile.level}</span>
          </div>
          <StreakBadge compact />
        </div>
      )}

      {/* XP Bar */}
      {profile && !collapsed && (
        <div className="sidebar-xp">
          <XPBar />
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
            end={item.to === '/'}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <button className="sidebar-nav-item" onClick={toggleLang}>
          <Globe size={20} />
          {!collapsed && (
            <span>{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
          )}
        </button>
        <button className="sidebar-nav-item" onClick={handleLogout}>
          <LogOut size={20} />
          {!collapsed && <span>{t('auth.logout')}</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button className="sidebar-toggle" onClick={onToggle}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
