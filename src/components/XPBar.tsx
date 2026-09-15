import { useAuth } from '../contexts/AuthContext';
import './XPBar.css';

export default function XPBar() {
  const { profile } = useAuth();
  if (!profile) return null;

  const currentLevelXP = (profile.level - 1) * 100;
  const nextLevelXP = profile.level * 100;
  const progressXP = profile.xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  const percent = Math.min((progressXP / neededXP) * 100, 100);

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <span className="xp-bar-level">Lv.{profile.level}</span>
        <span className="xp-bar-value">{progressXP}/{neededXP} XP</span>
      </div>
      <div className="progress-bar" style={{ height: '6px' }}>
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
