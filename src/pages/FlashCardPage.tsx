import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Check, X, ChevronLeft, ChevronRight, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../lib/supabase';
import type { Lesson, FlashCard } from '../lib/supabase';
import './FlashCardPage.css';

export default function FlashCardPage() {
  const { id } = useParams<{ id: string }>();
  const { user, addXP } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [earnedXP, setEarnedXP] = useState(0);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      setLesson(data as Lesson);
      setCards(data.content as FlashCard[]);
    }
    setLoading(false);
  };

  const handleFlip = () => setFlipped(!flipped);

  const handleKnown = () => {
    const newKnown = new Set(knownCards);
    newKnown.add(currentIndex);
    setKnownCards(newKnown);
    goNext();
  };

  const handleUnknown = () => {
    const newKnown = new Set(knownCards);
    newKnown.delete(currentIndex);
    setKnownCards(newKnown);
    goNext();
  };

  const goNext = () => {
    setFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = async () => {
    setCompleted(true);
    if (!user || !lesson) return;

    const score = knownCards.size;
    const maxScore = cards.length;
    const xpEarned = maxScore > 0 ? Math.round((score / maxScore) * 30) + 10 : 10;
    setEarnedXP(xpEarned);

    try {
      await supabase.from('lesson_attempts').insert({
        lesson_id: lesson.id,
        user_id: user.id,
        score,
        max_score: maxScore,
        xp_earned: xpEarned,
        answers: { known: Array.from(knownCards) },
      });

      await addXP(xpEarned);
    } catch (err) {
      console.error('Failed to record flashcard attempt or add XP:', err);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards(new Set());
    setEarnedXP(0);
    setCompleted(false);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!lesson || cards.length === 0) return null;

  const progress = ((currentIndex + 1) / cards.length) * 100;

  if (completed) {
    const score = knownCards.size;
    const percent = Math.round((score / cards.length) * 100);
    const displayXP = earnedXP || (cards.length > 0 ? Math.round((score / cards.length) * 30) + 10 : 10);

    return (
      <div className="page-enter flashcard-complete">
        <div className="complete-card card">
          <Trophy size={64} color="var(--warning)" />
          <h2>{t('flashcard.complete')}</h2>
          <p>{t('flashcard.complete_desc')}</p>

          <div className="complete-stats">
            <div className="complete-stat">
              <span className="complete-stat-value">{score}/{cards.length}</span>
              <span className="complete-stat-label">{t('flashcard.known')}</span>
            </div>
            <div className="complete-stat">
              <span className="complete-stat-value">{percent}%</span>
              <span className="complete-stat-label">{t('quiz.score')}</span>
            </div>
          </div>

          <div className="complete-xp">
            <Zap size={20} color="var(--accent)" />
            <span>+{displayXP} XP</span>
          </div>

          <div className="complete-actions">
            <button className="btn btn-outline" onClick={handleRestart}>
              <RotateCcw size={16} />
              {t('flashcard.restart')}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/lessons')}>
              {t('flashcard.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter flashcard-page">
      {/* Header */}
      <div className="flashcard-header">
        <button className="btn btn-ghost" onClick={() => navigate('/lessons')}>
          <ArrowLeft size={18} />
          {t('common.back')}
        </button>
        <h3>{lesson.title}</h3>
        <span className="flashcard-counter">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <div className="flashcard-container" onClick={handleFlip}>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
          <div className="flashcard-front">
            <span className="flashcard-label">Q</span>
            <p>{cards[currentIndex].front}</p>
          </div>
          <div className="flashcard-back">
            <span className="flashcard-label">A</span>
            <p>{cards[currentIndex].back}</p>
          </div>
        </div>
      </div>

      <p className="flashcard-hint">{t('flashcard.flip')}</p>

      {/* Controls */}
      <div className="flashcard-controls">
        <button className="btn btn-ghost btn-icon" onClick={goPrev} disabled={currentIndex === 0}>
          <ChevronLeft size={24} />
        </button>

        <button className="flashcard-action-btn unknown" onClick={handleUnknown}>
          <X size={24} />
          <span>{t('flashcard.unknown')}</span>
        </button>

        <button className="flashcard-action-btn known" onClick={handleKnown}>
          <Check size={24} />
          <span>{t('flashcard.known')}</span>
        </button>

        <button
          className="btn btn-ghost btn-icon"
          onClick={goNext}
          disabled={currentIndex === cards.length - 1}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
