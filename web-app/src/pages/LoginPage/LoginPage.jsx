import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import styles from './LoginPage.module.css';
import { Gavel, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) return;

    const result = await login(form);
    if (result.success) {
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } else {
      setError({
        message: result.error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.',
        traceId: result.error?.traceId,
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleAuthUrl();
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Brand Mark */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Gavel size={28} strokeWidth={2} />
          </div>
          <h1 className={styles.brandName}>Bid<span>Vault</span></h1>
          <p className={styles.brandTagline}>Nền tảng đấu giá trực tuyến</p>
        </div>

        {/* Login Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Đăng nhập</h2>
            <p className={styles.subtitle}>Chào mừng trở lại</p>
          </div>

          {error && (
            <ErrorAlert
              message={error.message}
              traceId={error.traceId}
              onDismiss={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Tên đăng nhập</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập..."
                className={`form-input ${error ? 'error' : ''}`}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Mật khẩu</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu..."
                  className={`form-input ${error ? 'error' : ''}`}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-submit"
              className={`btn btn-primary btn-lg btn-full ${loading ? 'btn-loading' : ''}`}
              disabled={loading || !form.username || !form.password}
            >
              {!loading && 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>hoặc</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Google OAuth2 Button */}
          <button
            id="btn-login-google"
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
            </svg>
            Đăng nhập với Google
          </button>

          <div className={styles.footer}>
            <span>Chưa có tài khoản?</span>
            <Link to="/register" id="link-to-register" className={styles.link}>
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
