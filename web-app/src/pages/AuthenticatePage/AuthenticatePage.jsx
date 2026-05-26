import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Gavel, Loader2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AuthenticatePage.module.css';

/**
 * AuthenticatePage — Google OAuth2 callback handler.
 *
 * Google redirects here after user consents: /authenticate?code=...&state=...
 * This page reads the `code` param, sends it to the Identity Service,
 * and redirects to home on success or shows an error on failure.
 */
export default function AuthenticatePage() {
  const [searchParams] = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Strict Mode guard — prevent double invocation in dev
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage('Bạn đã huỷ đăng nhập Google.');
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMessage('Không tìm thấy authorization code từ Google.');
      return;
    }

    loginWithGoogle(code).then((result) => {
      if (result.success) {
        toast.success('Đăng nhập Google thành công!');
        navigate('/', { replace: true });
      } else {
        setStatus('error');
        setErrorMessage(
          result.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
        );
      }
    });
  }, [searchParams, loginWithGoogle, navigate]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Gavel size={32} strokeWidth={2} className={styles.brandIcon} />
          <span className={styles.brandName}>
            Bid<span>Vault</span>
          </span>
        </div>

        {status === 'loading' && (
          <div className={styles.content}>
            <Loader2 size={40} className={styles.spinner} />
            <h2 className={styles.title}>Đang xác thực...</h2>
            <p className={styles.subtitle}>
              Đang hoàn tất đăng nhập với Google, vui lòng chờ.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.content}>
            <XCircle size={40} className={styles.errorIcon} />
            <h2 className={styles.title}>Đăng nhập thất bại</h2>
            <p className={styles.subtitle}>{errorMessage}</p>
            <button
              className={styles.retryBtn}
              onClick={() => navigate('/login', { replace: true })}
            >
              Quay lại trang đăng nhập
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
