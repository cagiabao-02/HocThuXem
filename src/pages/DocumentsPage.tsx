import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
  File,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import { supabase } from '../lib/supabase';
import type { Document } from '../lib/supabase';
import { parseDocument } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import './DocumentsPage.css';

export default function DocumentsPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    setDocuments(data || []);
    setLoading(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    for (const file of Array.from(files)) {
      const validExts = ['.pdf', '.txt', '.docx'];
      const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      
      if (!validExts.includes(ext)) {
        alert('Định dạng không hỗ trợ. Vui lòng upload PDF, TXT, hoặc DOCX.');
        continue;
      }

      setUploading(true);

      try {
        // 1. Create document record first (status: processing)
        const { data: doc } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            title: file.name.replace(/\.[^/.]+$/, ''),
            file_type: ext.replace('.', ''),
            status: 'processing',
          })
          .select()
          .single();

        if (doc) {
          // 2. Parse document via backend API
          try {
            const result = await parseDocument(file);
            await supabase
              .from('documents')
              .update({
                extracted_text: result.text,
                status: 'ready',
              })
              .eq('id', doc.id);
          } catch (parseErr: any) {
            console.error('Parse error:', parseErr);
            await supabase
              .from('documents')
              .update({ status: 'error' })
              .eq('id', doc.id);
            alert('Lỗi xử lý file: ' + (parseErr.message || 'Unknown error'));
          }
        }

        await loadDocuments();
      } catch (err: any) {
        console.error('Upload error:', err);
        alert('Lỗi upload: ' + (err.message || 'Unknown error'));
      }

      setUploading(false);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(t('common.confirm') + '?')) return;

    if (doc.file_path) {
      await supabase.storage.from('documents').remove([doc.file_path]);
    }
    await supabase.from('documents').delete().eq('id', doc.id);
    await loadDocuments();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle size={16} className="status-ready" />;
      case 'processing': return <Loader size={16} className="status-processing" />;
      case 'error': return <AlertCircle size={16} className="status-error" />;
      default: return <Clock size={16} className="status-pending" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return t('documents.ready');
      case 'processing': return t('documents.processing');
      case 'error': return t('documents.error');
      default: return t('documents.pending');
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>{t('documents.title')}</h1>
      </div>

      {/* Upload area */}
      <div
        className={`upload-zone ${dragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <>
            <div className="spinner spinner-lg" />
            <p>{t('documents.processing')}</p>
          </>
        ) : (
          <>
            <Upload size={40} />
            <p className="upload-title">{t('documents.upload')}</p>
            <p className="upload-desc">{t('documents.upload_desc')}</p>
            <span className="upload-formats">{t('documents.supported')}</span>
          </>
        )}
      </div>

      {/* Documents list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div className="spinner spinner-lg" />
        </div>
      ) : documents.length > 0 ? (
        <div className="documents-grid stagger-children">
          {documents.map((doc) => (
            <div className="document-card card" key={doc.id}>
              <div className="document-card-header">
                <div className="document-icon">
                  <File size={24} />
                </div>
                <div className="document-info">
                  <h4 className="document-title">{doc.title}</h4>
                  <div className="document-meta">
                    <span className={`document-status status-${doc.status}`}>
                      {getStatusIcon(doc.status)}
                      {getStatusText(doc.status)}
                    </span>
                    <span className="document-type badge badge-primary">
                      {doc.file_type?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {doc.extracted_text && (
                <p className="document-preview">
                  {doc.extracted_text.substring(0, 150)}...
                </p>
              )}

              <div className="document-actions">
                {doc.status === 'ready' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/lessons', { state: { documentId: doc.id } })}
                  >
                    <BookOpen size={14} />
                    {t('documents.create_lesson')}
                  </button>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(doc)}
                >
                  <Trash2 size={14} />
                  {t('documents.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={64} />
          <h3>{t('documents.empty')}</h3>
          <p>{t('documents.empty_desc')}</p>
        </div>
      )}
    </div>
  );
}
