import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../lib/supabase';
import type { Lesson, QuizQuestion } from '../lib/supabase';
import './QuizPage.css';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const { user, addXP } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    if (!id) return;
    const { data } = await supabase.from('lessons').select('*').eq('id', id).single();
    if (data) {
      setLesson(data as Lesson);
      setQuestions(data.content as QuizQuestion[]);
    }
    setLoading(false);
  };

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    setAnswers([...answers, selectedAnswer]);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setCompleted(true);
    if (!user || !lesson) return;

    const finalAnswers = [...answers, selectedAnswer!];
    const correctCount = finalAnswers.filter(
      (ans, i) => ans === questions[i].correct_index
    ).length;
    const xpEarned = Math.round((correctCount / questions.length) * 40) + 10;

    await supabase.from('lesson_attempts').insert({
      lesson_id: lesson.id,
      user_id: user.id,
      score: correctCount,
      max_score: questions.length,
      xp_earned: xpEarned,
      answers: { selected: finalAnswers },
    });

    await addXP(xpEarned);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setCompleted(false);
  };

  if (loading) {
    return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  }

  if (!lesson || questions.length === 0) return null;

  // Completed screen
  if (completed) {
    const allAnswers = [...answers];
    const correctCount = allAnswers.filter((ans, i) => ans === questions[i].correct_index).length;
    const percent = Math.round((correctCount / questions.length) * 100);
    const xpEarned = Math.round((correctCount / questions.length) * 40) + 10;

    return (
      <div className="page-enter quiz-complete">
        <div className="complete-card card">
          <Trophy size={64} color="var(--warning)" />
          <h2>{t('quiz.result')}</h2>

          <div className="quiz-score-circle">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-color)" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={percent >= 70 ? 'var(--success)' : percent >= 40 ? 'var(--warning)' : 'var(--error)'}
                strokeWidth="8"
                strokeDasharray={`${percent * 3.27} 327`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="quiz-score-text">
              <span className="quiz-score-value">{percent}%</span>
              <span className="quiz-score-detail">{correctCount}/{questions.length}</span>
            </div>
          </div>

          <div className="complete-xp">
            <Zap size={20} color="var(--accent)" />
            <span>+{xpEarned} XP</span>
          </div>

          <div className="complete-actions">
            <button className="btn btn-outline" onClick={handleRestart}>
              <RotateCcw size={16} />
              {t('quiz.retry')}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/lessons')}>
              {t('quiz.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const isCorrect = selectedAnswer === question.correct_index;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="page-enter quiz-page">
      <div className="flashcard-header">
        <button className="btn btn-ghost" onClick={() => navigate('/lessons')}>
          <ArrowLeft size={18} />
          {t('common.back')}
        </button>
        <h3>{lesson.title}</h3>
        <span className="flashcard-counter">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="quiz-question card">
        <span className="quiz-question-label">
          {t('quiz.question')} {currentIndex + 1} {t('quiz.of')} {questions.length}
        </span>
        <h3 className="quiz-question-text">{question.question}</h3>

        <div className="quiz-options">
          {question.options.map((option, i) => {
            let optionClass = 'quiz-option';
            if (showResult) {
              if (i === question.correct_index) optionClass += ' correct';
              else if (i === selectedAnswer) optionClass += ' incorrect';
            } else if (i === selectedAnswer) {
              optionClass += ' selected';
            }

            return (
              <button
                key={i}
                className={optionClass}
                onClick={() => handleSelect(i)}
                disabled={showResult}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="quiz-option-text">{option}</span>
                {showResult && i === question.correct_index && <CheckCircle size={20} />}
                {showResult && i === selectedAnswer && i !== question.correct_index && <XCircle size={20} />}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="quiz-feedback-header">
              {isCorrect ? (
                <><CheckCircle size={20} /> {t('quiz.correct')}</>
              ) : (
                <><XCircle size={20} /> {t('quiz.incorrect')}</>
              )}
            </div>
            {question.explanation && (
              <p className="quiz-feedback-text">
                <strong>{t('quiz.explanation')}:</strong> {question.explanation}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="quiz-actions">
          {!showResult ? (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              {t('quiz.submit')}
            </button>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? t('quiz.next') : t('quiz.result')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
