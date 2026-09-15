import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LangContext';
import './LoginPage.css';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          navigate('/');
        }
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, username, displayName || username);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccess(t('auth.signup_success'));
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="login-container">
        {/* Left panel - branding */}
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="login-logo">
              <GraduationCap size={48} />
            </div>
            <h1>HocThuXem</h1>
            <p>{t('auth.subtitle')}</p>

            <div className="login-features">
              <div className="login-feature">
                <Sparkles size={20} />
                <span>AI tạo bài học từ tài liệu</span>
              </div>
              <div className="login-feature">
                <Sparkles size={20} />
                <span>Flash Card, Trắc nghiệm, Tự luận</span>
              </div>
              <div className="login-feature">
                <Sparkles size={20} />
                <span>XP, Chuỗi ngày, Xếp hạng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="login-form-panel">
          <div className="login-form-container">
            <h2>{isLogin ? t('auth.login') : t('auth.signup')}</h2>
            <p className="login-form-subtitle">
              {t('auth.welcome')} <strong>HocThuXem</strong>
            </p>

            {error && <div className="login-error">{error}</div>}
            {success && <div className="login-success">{success}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <>
                  <div className="input-group">
                    <label>{t('auth.username')}</label>
                    <input
                      className="input"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>{t('auth.display_name')}</label>
                    <input
                      className="input"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tên hiển thị"
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <label>{t('auth.email')}</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="input-group">
                <label>{t('auth.password')}</label>
                <div className="password-input-wrapper">
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg login-submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                ) : (
                  isLogin ? t('auth.login') : t('auth.signup')
                )}
              </button>
            </form>

            <p className="login-switch">
              {isLogin ? t('auth.no_account') : t('auth.has_account')}{' '}
              <button
                className="login-switch-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
              >
                {isLogin ? t('auth.signup') : t('auth.login')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
