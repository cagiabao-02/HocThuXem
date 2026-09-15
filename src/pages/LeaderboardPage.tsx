import { useState, useEffect } from 'react';
import { Medal, Flame, Zap, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('xp', { ascending: false })
      .limit(50);
    setPlayers(data || []);
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="rank-gold" />;
    if (rank === 2) return <Medal size={20} className="rank-silver" />;
    if (rank === 3) return <Medal size={20} className="rank-bronze" />;
    return <span className="rank-number">{rank}</span>;
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>{t('leaderboard.title')}</h1>
      </div>

      {/* Top 3 podium */}
      {!loading && players.length >= 3 && (
        <div className="podium stagger-children">
          {[1, 0, 2].map((idx) => {
            const player = players[idx];
            const rank = idx + 1;
            return (
              <div
                key={player.id}
                className={`podium-item rank-${rank} ${player.id === user?.id ? 'is-you' : ''}`}
              >
                <div className="podium-avatar avatar avatar-lg">
                  {player.display_name?.[0]?.toUpperCase() || player.username[0]?.toUpperCase()}
                </div>
                <div className="podium-crown">
                  {rank === 1 && <Crown size={28} className="rank-gold" />}
                </div>
                <span className="podium-name">
                  {player.display_name || player.username}
                  {player.id === user?.id && <span className="you-badge">{t('leaderboard.you')}</span>}
                </span>
                <span className="podium-xp">
                  <Zap size={14} /> {player.xp.toLocaleString()} XP
                </span>
                <div className={`podium-bar bar-${rank}`}>
                  <span>#{rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full leaderboard table */}
      <div className="card leaderboard-card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="leaderboard-header-row">
              <span className="lb-col-rank">{t('leaderboard.rank')}</span>
              <span className="lb-col-player">{t('leaderboard.player')}</span>
              <span className="lb-col-level">{t('leaderboard.level')}</span>
              <span className="lb-col-streak">{t('leaderboard.streak')}</span>
              <span className="lb-col-xp">{t('leaderboard.xp')}</span>
            </div>

            {players.map((player, i) => (
              <div
                key={player.id}
                className={`leaderboard-row ${player.id === user?.id ? 'is-you' : ''}`}
              >
                <span className="lb-col-rank">{getRankIcon(i + 1)}</span>
                <span className="lb-col-player">
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: '12px' }}>
                    {player.display_name?.[0]?.toUpperCase() || player.username[0]?.toUpperCase()}
                  </div>
                  <span className="lb-player-name">
                    {player.display_name || player.username}
                    {player.id === user?.id && (
                      <span className="you-badge">{t('leaderboard.you')}</span>
                    )}
                  </span>
                </span>
                <span className="lb-col-level">
                  <span className="badge badge-primary">Lv.{player.level}</span>
                </span>
                <span className="lb-col-streak">
                  <Flame size={14} color={player.current_streak > 0 ? '#FF9800' : 'var(--text-muted)'} />
                  {player.current_streak}
                </span>
                <span className="lb-col-xp">
                  <strong>{player.xp.toLocaleString()}</strong>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
