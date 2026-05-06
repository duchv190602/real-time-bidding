import styles from './Navbar.module.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Gavel, LogOut, LogIn, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <Gavel size={22} strokeWidth={2.5} />
          <span>Bid<strong>Vault</strong></span>
        </Link>

        {/* Nav Links */}
        <div className={styles.links}>
          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            Đấu Giá
          </Link>
          {isAdmin && (
            <Link
              to="/admin/auctions"
              className={`${styles.navLink} ${location.pathname.startsWith('/admin') ? styles.active : ''}`}
            >
              Quản lý Đấu Giá
            </Link>
          )}
        </div>

        {/* Auth Controls */}
        <div className={styles.controls}>
          {isAuthenticated ? (
            <>
              <div className={styles.userInfo}>
                <User size={14} />
                <span>{user?.username}</span>
              </div>
              <button
                className={`btn btn-outline btn-sm ${styles.logoutBtn}`}
                onClick={handleLogout}
                id="btn-logout"
                aria-label="Đăng xuất"
              >
                <LogOut size={14} />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" id="btn-login-nav">
                <LogIn size={14} />
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="btn-register-nav">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
