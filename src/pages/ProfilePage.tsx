import { useState, useEffect } from 'react';
import {
  Zap, Flame, BookOpen, FileText, Calendar, Edit3, Save, X, Trophy, Target,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../lib/supabase';
import { getAvailableLanguages } from '../lib/i18n';
import './ProfilePage.css';

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const { t, lang, setLang } = useLang();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    const [attempts, docs] = await Promise.all([
      supabase.from('lesson_attempts').select('id', { count: 'exact', head: true }),
      supabase.from('documents').select('id', { count: 'exact', head: true }),
    ]);
    setTotalAttempts(attempts.count || 0);
    setTotalDocs(docs.count || 0);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ display_name: displayName });
    setEditing(false);
    setSaving(false);
  };

  if (!profile) return null;

  const xpToNext = profile.level * 100 - profile.xp;
  const joinDate = new Date(profile.created_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>{t('profile.title')}</h1>
      </div>

      <div className="profile-grid">
        {/* Profile card */}
        <div className="card profile-card">
          <div className="profile-card-bg" />
          <div className="profile-card-content">
            <div className="avatar avatar-xl profile-avatar">
              {profile.display_name?.[0]?.toUpperCase() || profile.username[0]?.toUpperCase()}
            </div>

            {editing ? (
              <div className="profile-edit-form">
                <input
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('auth.display_name')}
                />
                <div className="profile-edit-actions">
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    <Save size={14} /> {t('profile.save')}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                    <X size={14} /> {t('profile.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="profile-name">{profile.display_name || profile.username}</h2>
                <p className="profile-username">@{profile.username}</p>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                  <Edit3 size={14} /> {t('profile.edit')}
                </button>
              </>
            )}

            <div className="profile-meta">
              <span><Calendar size={14} /> {t('profile.joined')}: {joinDate}</span>
            </div>

            {/* XP Progress */}
            <div className="profile-xp-section">
              <div className="profile-xp-header">
                <span className="profile-xp-level">Level {profile.level}</span>
                <span className="profile-xp-next">{xpToNext > 0 ? `${xpToNext} XP ${lang === 'vi' ? 'nữa để lên level' : 'to next level'}` : ''}</span>
              </div>
              <div className="progress-bar" style={{ height: '10px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${((profile.xp % 100) / 100) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="profile-stats stagger-children">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(109, 151, 193, 0.12)', color: '#6D97C1' }}>
              <Zap size={24} />
            </div>
            <div>
              <div className="stat-value">{profile.xp.toLocaleString()}</div>
              <div className="stat-label">{t('dashboard.xp')}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(255, 152, 0, 0.12)', color: '#FF9800' }}>
              <Flame size={24} />
            </div>
            <div>
              <div className="stat-value">{profile.current_streak}</div>
              <div className="stat-label">{t('dashboard.streak')}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(76, 175, 80, 0.12)', color: '#4CAF50' }}>
              <Trophy size={24} />
            </div>
            <div>
              <div className="stat-value">{profile.max_streak}</div>
              <div className="stat-label">{lang === 'vi' ? 'Chuỗi tốt nhất' : 'Best Streak'}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(231, 76, 60, 0.12)', color: '#E74C3C' }}>
              <Target size={24} />
            </div>
            <div>
              <div className="stat-value">{totalAttempts}</div>
              <div className="stat-label">{t('dashboard.lessons_completed')}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(53, 80, 112, 0.12)', color: 'var(--primary)' }}>
              <FileText size={24} />
            </div>
            <div>
              <div className="stat-value">{totalDocs}</div>
              <div className="stat-label">{t('dashboard.documents')}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(109, 151, 193, 0.12)', color: '#6D97C1' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div className="stat-value">Lv.{profile.level}</div>
              <div className="stat-label">{t('dashboard.level')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card profile-settings">
        <h3>{t('profile.settings')}</h3>
        <div className="settings-item">
          <div className="settings-label">
            <span>{t('profile.language')}</span>
          </div>
          <div className="settings-control">
            {getAvailableLanguages().map((l) => (
              <button
                key={l.code}
                className={`btn btn-sm ${lang === l.code ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setLang(l.code)}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
