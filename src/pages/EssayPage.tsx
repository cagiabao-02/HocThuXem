import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Trophy, RotateCcw, Zap, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../lib/supabase';
import type { Lesson, EssayQuestion } from '../lib/supabase';
import { gradeEssay } from '../lib/api';
import './EssayPage.css';

export default function EssayPage() {
  const { id } = useParams<{ id: string }>();
  const { user, addXP } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<EssayQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; maxScore: number; feedback: string } | null>(null);
  const [allScores, setAllScores] = useState<{ score: number; maxScore: number }[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [earnedXP, setEarnedXP] = useState(0);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    if (!id) return;
    const { data } = await supabase.from('lessons').select('*').eq('id', id).single();
    if (data) {
      setLesson(data as Lesson);
      setQuestions(data.content as EssayQuestion[]);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const q = questions[currentIndex];
    setGrading(true);

    try {
      const result = await gradeEssay(q.question, answer, q.rubric, q.sample_answer, lang);
      setFeedback(result);
      setAllScores([...allScores, { score: result.score, maxScore: result.maxScore }]);
    } catch (err: any) {
      setFeedback({ score: 0, maxScore: 10, feedback: err.message || 'Grading failed' });
    }
    setGrading(false);
  };

  const handleNext = () => {
    setAnswer('');
    setFeedback(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setCompleted(true);
    if (!user || !lesson) return;

    const totalScore = allScores.reduce((sum, s) => sum + s.score, 0);
    const totalMax = allScores.reduce((sum, s) => sum + s.maxScore, 0);
    const xpEarned = totalMax > 0 ? Math.round((totalScore / totalMax) * 50) + 10 : 10;
    setEarnedXP(xpEarned);

    try {
      await supabase.from('lesson_attempts').insert({
        lesson_id: lesson.id,
        user_id: user.id,
        score: totalScore,
        max_score: totalMax,
        xp_earned: xpEarned,
        answers: { scores: allScores },
      });

      await addXP(xpEarned);
    } catch (err) {
      console.error('Failed to record essay attempt or add XP:', err);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswer('');
    setFeedback(null);
    setAllScores([]);
    setEarnedXP(0);
    setCompleted(false);
  };

  if (loading) {
    return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  }

  if (!lesson || questions.length === 0) return null;

  if (completed) {
    const totalScore = allScores.reduce((sum, s) => sum + s.score, 0);
    const totalMax = allScores.reduce((sum, s) => sum + s.maxScore, 0);
    const percent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    const displayXP = earnedXP || (totalMax > 0 ? Math.round((totalScore / totalMax) * 50) + 10 : 10);

    return (
      <div className="page-enter quiz-complete">
        <div className="complete-card card">
          <Trophy size={64} color="var(--warning)" />
          <h2>{t('essay.complete')}</h2>
          <div className="complete-stats">
            <div className="complete-stat">
              <span className="complete-stat-value">{percent}%</span>
              <span className="complete-stat-label">{t('essay.score')}</span>
            </div>
            <div className="complete-stat">
              <span className="complete-stat-value">{totalScore}/{totalMax}</span>
              <span className="complete-stat-label">{t('quiz.score')}</span>
            </div>
          </div>
          <div className="complete-xp">
            <Zap size={20} color="var(--accent)" />
            <span>+{displayXP} XP</span>
          </div>
          <div className="complete-actions">
            <button className="btn btn-outline" onClick={handleRestart}>
              <RotateCcw size={16} />{t('quiz.retry')}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/lessons')}>
              {t('essay.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="page-enter essay-page">
      <div className="flashcard-header">
        <button className="btn btn-ghost" onClick={() => navigate('/lessons')}>
          <ArrowLeft size={18} />
          {t('common.back')}
        </button>
        <h3>{lesson.title}</h3>
        <span className="flashcard-counter">{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="essay-question card">
        <div className="essay-question-header">
          <MessageSquare size={24} color="var(--accent)" />
          <h3>{question.question}</h3>
        </div>

        <textarea
          className="input essay-textarea"
          placeholder={t('essay.write')}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!feedback}
          rows={8}
        />

        {/* Feedback */}
        {feedback && (
          <div className="essay-feedback" style={{ animation: 'slideUp 300ms ease' }}>
            <div className="essay-feedback-score">
              <span className="essay-score-value">{feedback.score}/{feedback.maxScore}</span>
              <span className="essay-score-label">{t('essay.score')}</span>
            </div>
            <div className="essay-feedback-text">
              <h4>{t('essay.feedback')}</h4>
              <p>{feedback.feedback}</p>
            </div>
          </div>
        )}

        <div className="quiz-actions" style={{ marginTop: 'var(--space-4)' }}>
          {!feedback ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={!answer.trim() || grading}
            >
              {grading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  {t('essay.grading')}
                </>
              ) : (
                <>
                  <Send size={16} />
                  {t('essay.submit')}
                </>
              )}
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? t('essay.next') : t('essay.complete')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
