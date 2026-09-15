import { Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import './StreakBadge.css';

export default function StreakBadge({ compact = false }: { compact?: boolean }) {
  const { profile } = useAuth();
  const { t } = useLang();
  if (!profile) return null;

  const isActive = profile.current_streak > 0;

  return (
    <div className={`streak-badge ${isActive ? 'active' : ''} ${compact ? 'compact' : ''}`}>
      <Flame size={compact ? 16 : 20} className={isActive ? 'flame-active' : ''} />
      {!compact && (
        <div className="streak-info">
          <span className="streak-count">{profile.current_streak}</span>
          <span className="streak-label">
            {profile.current_streak === 1 ? t('dashboard.day') : t('dashboard.days')}
          </span>
        </div>
      )}
      {compact && <span className="streak-count-compact">{profile.current_streak}</span>}
    </div>
  );
}
