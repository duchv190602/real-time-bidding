import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
