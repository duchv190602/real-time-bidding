import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import styles from './RegisterPage.module.css';
import { Gavel, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  username: '',
  password: '',
  email: '',
  firstName: '',
  lastName: '',
};

function validate(form) {
  const errors = {};
  if (form.username.length < 4) errors.username = 'Tên đăng nhập tối thiểu 4 ký tự';
  if (form.password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự';
  if (!form.email.includes('@')) errors.email = 'Email không hợp lệ';
  return errors;
}

export default function RegisterPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const result = await register(form);
    if (result.success) {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      setServerError({
        message: result.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.',
        traceId: result.error?.traceId,
      });
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Gavel size={28} strokeWidth={2} />
          </div>
          <h1 className={styles.brandName}>Bid<span>Vault</span></h1>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Tạo tài khoản</h2>
            <p className={styles.subtitle}>Tham gia ngay để bắt đầu đấu giá</p>
          </div>

          {serverError && (
            <ErrorAlert
              message={serverError.message}
              traceId={serverError.traceId}
              onDismiss={() => setServerError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.nameRow}>
              <div className="form-group">
                <label className="form-label" htmlFor="firstName">Họ</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Nguyễn"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lastName">Tên</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Văn A"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Tên đăng nhập *</label>
              <input
                id="reg-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Ít nhất 4 ký tự..."
                className={`form-input ${fieldErrors.username ? 'error' : ''}`}
              />
              {fieldErrors.username && (
                <span className="form-error">{fieldErrors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email *</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className={`form-input ${fieldErrors.email ? 'error' : ''}`}
              />
              {fieldErrors.email && (
                <span className="form-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Mật khẩu *</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 6 ký tự..."
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="form-error">{fieldErrors.password}</span>
              )}
            </div>

            <button
              type="submit"
              id="btn-register-submit"
              className={`btn btn-primary btn-lg btn-full ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {!loading && 'Tạo tài khoản'}
            </button>
          </form>

          <div className={styles.footer}>
            <span>Đã có tài khoản?</span>
            <Link to="/login" id="link-to-login" className={styles.link}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
