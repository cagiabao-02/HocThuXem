import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Flame,
  FileText,
  BookOpen,
  Upload,
  Plus,
  TrendingUp,
  Clock,
  Star,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../lib/supabase';
import type { LessonAttempt } from '../lib/supabase';
import './DashboardPage.css';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [docCount, setDocCount] = useState(0);
  const [lessonCount, setLessonCount] = useState(0);
  const [recentAttempts, setRecentAttempts] = useState<(LessonAttempt & { lesson_title?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      const [docs, lessons, attempts] = await Promise.all([
        supabase.from('documents').select('id', { count: 'exact', head: true }),
        supabase.from('lesson_attempts').select('id', { count: 'exact', head: true }),
        supabase
          .from('lesson_attempts')
          .select('*, lessons(title)')
          .order('completed_at', { ascending: false })
          .limit(5),
      ]);

      setDocCount(docs.count || 0);
      setLessonCount(lessons.count || 0);
      setRecentAttempts(
        (attempts.data || []).map((a: any) => ({
          ...a,
          lesson_title: a.lessons?.title,
        }))
      );
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  if (!profile) return null;

  const stats = [
    {
      icon: Zap,
      label: t('dashboard.xp'),
      value: profile.xp.toLocaleString(),
      color: '#6D97C1',
      bg: 'rgba(109, 151, 193, 0.12)',
    },
    {
      icon: Star,
      label: t('dashboard.level'),
      value: profile.level,
      color: '#FF9800',
      bg: 'rgba(255, 152, 0, 0.12)',
    },
    {
      icon: Flame,
      label: t('dashboard.streak'),
      value: `${profile.current_streak} ${profile.current_streak === 1 ? t('dashboard.day') : t('dashboard.days')}`,
      color: '#E74C3C',
      bg: 'rgba(231, 76, 60, 0.12)',
    },
    {
      icon: FileText,
      label: t('dashboard.documents'),
      value: docCount,
      color: '#4CAF50',
      bg: 'rgba(76, 175, 80, 0.12)',
    },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            {t('dashboard.welcome')}, {profile.display_name || profile.username}! 👋
          </h1>
          <p className="dashboard-subtitle">
            {t('dashboard.lessons_completed')}: <strong>{lessonCount}</strong>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid stagger-children">
        {stats.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div
              className="stat-icon"
              style={{ background: stat.bg, color: stat.color }}
            >
              <stat.icon size={24} />
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="card dashboard-actions">
          <h3>{t('dashboard.quick_actions')}</h3>
          <div className="action-buttons">
            <button
              className="action-btn"
              onClick={() => navigate('/documents')}
            >
              <div className="action-btn-icon" style={{ background: 'rgba(76, 175, 80, 0.12)', color: '#4CAF50' }}>
                <Upload size={24} />
              </div>
              <span>{t('dashboard.upload_doc')}</span>
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/lessons')}
            >
              <div className="action-btn-icon" style={{ background: 'rgba(109, 151, 193, 0.12)', color: '#6D97C1' }}>
                <Plus size={24} />
              </div>
              <span>{t('dashboard.create_lesson')}</span>
            </button>
            <button
              className="action-btn"
              onClick={() => navigate('/leaderboard')}
            >
              <div className="action-btn-icon" style={{ background: 'rgba(255, 152, 0, 0.12)', color: '#FF9800' }}>
                <TrendingUp size={24} />
              </div>
              <span>{t('nav.leaderboard')}</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card dashboard-recent">
          <h3>{t('dashboard.recent')}</h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <div className="spinner" />
            </div>
          ) : recentAttempts.length > 0 ? (
            <div className="recent-list">
              {recentAttempts.map((attempt) => (
                <div className="recent-item" key={attempt.id}>
                  <div className="recent-item-icon">
                    <BookOpen size={16} />
                  </div>
                  <div className="recent-item-info">
                    <span className="recent-item-title">{attempt.lesson_title || 'Lesson'}</span>
                    <span className="recent-item-meta">
                      <Clock size={12} />
                      {new Date(attempt.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="recent-item-score">
                    <span className="recent-score-value">
                      {attempt.score}/{attempt.max_score}
                    </span>
                    <span className="recent-xp">+{attempt.xp_earned} XP</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">
              <BookOpen size={40} />
              <p>{t('dashboard.no_activity')}</p>
              <span>{t('dashboard.start_learning')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
