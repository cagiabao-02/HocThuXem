import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  HelpCircle,
  PenTool,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../lib/supabase';
import type { Document, Lesson } from '../lib/supabase';
import { generateLesson } from '../lib/api';
import './LessonsPage.css';

export default function LessonsPage() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Modal form state
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedType, setSelectedType] = useState<'flashcard' | 'quiz' | 'essay'>('flashcard');
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    loadData();
    // Auto-open modal if navigated from documents page
    if (location.state?.documentId) {
      setSelectedDocId(location.state.documentId);
      setShowModal(true);
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    const [lessonsRes, docsRes] = await Promise.all([
      supabase.from('lessons').select('*').order('created_at', { ascending: false }),
      supabase.from('documents').select('*').eq('status', 'ready'),
    ]);
    setLessons(lessonsRes.data || []);
    setDocuments(docsRes.data || []);
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!selectedDocId || !user) return;

    const doc = documents.find((d) => d.id === selectedDocId);
    if (!doc?.extracted_text) return;

    setGenerating(true);
    try {
      const result = await generateLesson(doc.extracted_text, selectedType, lang, questionCount);
      
      const { data: lesson } = await supabase
        .from('lessons')
        .insert({
          document_id: doc.id,
          user_id: user.id,
          title: result.title || `${doc.title} - ${t(`lessons.${selectedType}`)}`,
          description: result.description || '',
          lesson_type: selectedType,
          content: result.content,
          difficulty: result.difficulty || 1,
        })
        .select()
        .single();

      if (lesson) {
        setShowModal(false);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate lesson');
    }
    setGenerating(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flashcard': return Layers;
      case 'quiz': return HelpCircle;
      case 'essay': return PenTool;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flashcard': return { color: '#6D97C1', bg: 'rgba(109, 151, 193, 0.12)' };
      case 'quiz': return { color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.12)' };
      case 'essay': return { color: '#FF9800', bg: 'rgba(255, 152, 0, 0.12)' };
      default: return { color: '#355070', bg: 'rgba(53, 80, 112, 0.12)' };
    }
  };

  const filteredLessons = filter === 'all'
    ? lessons
    : lessons.filter((l) => l.lesson_type === filter);

  const handleStartLesson = (lesson: Lesson) => {
    navigate(`/${lesson.lesson_type}/${lesson.id}`);
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>{t('lessons.title')}</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            {t('lessons.generate')}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tabs lesson-tabs">
        {['all', 'flashcard', 'quiz', 'essay'].map((type) => (
          <button
            key={type}
            className={`tab ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? t('lessons.all') : t(`lessons.${type}`)}
          </button>
        ))}
      </div>

      {/* Lessons grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : filteredLessons.length > 0 ? (
        <div className="lessons-grid stagger-children">
          {filteredLessons.map((lesson) => {
            const TypeIcon = getTypeIcon(lesson.lesson_type);
            const colors = getTypeColor(lesson.lesson_type);
            const contentLength = Array.isArray(lesson.content) ? lesson.content.length : 0;

            return (
              <div
                className="lesson-card card card-interactive"
                key={lesson.id}
                onClick={() => handleStartLesson(lesson)}
              >
                <div className="lesson-card-top">
                  <div
                    className="lesson-type-icon"
                    style={{ background: colors.bg, color: colors.color }}
                  >
                    <TypeIcon size={24} />
                  </div>
                  <span className="badge" style={{ background: colors.bg, color: colors.color }}>
                    {t(`lessons.${lesson.lesson_type}`)}
                  </span>
                </div>

                <h4 className="lesson-card-title">{lesson.title}</h4>
                {lesson.description && (
                  <p className="lesson-card-desc">{lesson.description}</p>
                )}

                <div className="lesson-card-footer">
                  <span className="lesson-card-count">
                    {contentLength} {lesson.lesson_type === 'flashcard' ? t('lessons.cards') : t('lessons.questions')}
                  </span>
                  <div className="lesson-card-difficulty">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < lesson.difficulty ? colors.color : 'none'}
                        color={i < lesson.difficulty ? colors.color : 'var(--border-color)'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <BookOpen size={64} />
          <h3>{t('lessons.empty')}</h3>
          <p>{t('lessons.empty_desc')}</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            {t('lessons.generate')}
          </button>
        </div>
      )}

      {/* Generate lesson modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => !generating && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-6)' }}>
              <Sparkles size={20} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)' }} />
              {t('lessons.generate')}
            </h3>

            <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label>{t('lessons.select_doc')}</label>
              <select
                className="input"
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
              >
                <option value="">-- {t('lessons.select_doc')} --</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.title}</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label>{t('lessons.select_type')}</label>
              <div className="lesson-type-selector">
                {(['flashcard', 'quiz', 'essay'] as const).map((type) => {
                  const Icon = getTypeIcon(type);
                  const colors = getTypeColor(type);
                  return (
                    <button
                      key={type}
                      className={`lesson-type-option ${selectedType === type ? 'active' : ''}`}
                      style={selectedType === type ? { borderColor: colors.color, background: colors.bg } : {}}
                      onClick={() => setSelectedType(type)}
                    >
                      <Icon size={20} color={colors.color} />
                      <span>{t(`lessons.${type}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
              <label>{t('lessons.count')}</label>
              <input
                className="input"
                type="number"
                min={3}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
                disabled={generating}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={!selectedDocId || generating}
              >
                {generating ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    {t('lessons.generating')}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {t('lessons.generate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
