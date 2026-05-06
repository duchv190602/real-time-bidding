import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { auctionService } from '../../services/auctionService';
import { biddingService } from '../../services/biddingService';
import { useAuth } from '../../contexts/AuthContext';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import styles from './AuctionDetailPage.module.css';
import {
  ArrowLeft, Gavel, Clock, TrendingUp,
  Trophy, User, ShieldCheck, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { vi } from 'date-fns/locale';
import { IMAGES_BASE_URL } from '../../config/api';

const STATUS_LABEL = {
  DRAFT: 'Bản nháp',
  APPROVED: 'Đã duyệt — Sắp diễn ra',
  ACTIVE: 'Đang diễn ra',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

function useCountdown(endAt) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!endAt) return;

    const tick = () => {
      const end = new Date(endAt);
      const now = new Date();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Đã kết thúc');
        setIsUrgent(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setIsUrgent(diff < 60 * 60 * 1000); // < 1 hour

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endAt]);

  return { timeLeft, isUrgent };
}

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, token } = useAuth();

  // Admin action state
  const [actionLoading, setActionLoading] = useState(null); // 'approve'|'start'|'cancel'

  // Auction state — declared before hook so setAuction is in scope
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const priceRef = useRef(null);

  // Real-time bid updates via WebSocket
  useAuctionSocket(id, token, {
    onBidUpdate: (update) => {
      setAuction((prev) => {
        if (!prev) return prev;
        return { ...prev, currentPrice: update.newPrice };
      });
      if (priceRef.current) {
        priceRef.current.style.animation = 'none';
        void priceRef.current.offsetWidth;
        priceRef.current.style.animation = 'bidPop 600ms ease-out';
      }
    },
    onConnect: () => setWsConnected(true),
    onDisconnect: () => setWsConnected(false),
  });

  const { timeLeft, isUrgent } = useCountdown(
    auction?.status === 'ACTIVE' ? auction.endAt : null
  );

  const fetchAuction = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await auctionService.getAuctionById(id);
      setAuction(data);
      // Pre-fill bid with minimum bid (current + step)
      if (data.currentPrice && data.bidStep) {
        const minBid = parseFloat(data.currentPrice) + parseFloat(data.bidStep);
        setBidAmount(String(minBid));
      } else if (data.startPrice) {
        setBidAmount(String(data.startPrice));
      }
    } catch (err) {
      setFetchError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  const handleBid = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }

    const price = parseFloat(bidAmount);
    const currentPrice = parseFloat(auction?.currentPrice || auction?.startPrice || 0);
    const bidStep = parseFloat(auction?.bidStep || 0);
    const minBid = currentPrice + bidStep;

    if (isNaN(price) || price <= 0) { setBidError({ message: 'Giá thầu phải là một số dương hợp lệ.' }); return; }
    if (bidStep > 0 && price < minBid) {
      setBidError({ message: `Giá thầu tối thiểu phải là ${formatCurrency(minBid)} (giá hiện tại + bước giá).` });
      return;
    }

    setBidding(true); setBidError(null);
    try {
      await biddingService.placeBid({ auctionId: id, price });
      toast.success('🎯 Đặt giá thầu thành công!');
      setBidSuccess(true);
      if (priceRef.current) {
        priceRef.current.style.animation = 'none';
        void priceRef.current.offsetWidth;
        priceRef.current.style.animation = 'bidPop 600ms ease-out';
      }
      await fetchAuction();
      setBidSuccess(false);
    } catch (err) { setBidError(err); } finally { setBidding(false); }
  };

  // Admin action handlers
  const handleAdminAction = async (action) => {
    setActionLoading(action);
    try {
      if (action === 'approve') await auctionService.approveAuction(id);
      else if (action === 'start') await auctionService.startAuction(id);
      else if (action === 'cancel') await auctionService.cancelAuction(id);
      toast.success('Đã cập nhật trạng thái thành công!');
      await fetchAuction();
    } catch (err) {
      toast.error(err?.message || 'Thất bại, thử lại.');
    } finally { setActionLoading(null); }
  };

  if (loading) return <DetailSkeleton />;

  if (fetchError) {
    return (
      <div className={`container ${styles.errorPage}`}>
        <ErrorAlert message={fetchError.message} traceId={fetchError.traceId} />
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Về trang chủ
        </button>
      </div>
    );
  }

  if (!auction) return null;

  const imageUrl = auction.imageUrl ? `${IMAGES_BASE_URL}${auction.imageUrl}` : null;
  const isActive = auction.status === 'ACTIVE';
  const canBid = isActive && isAuthenticated && !isAdmin;
  const minBid = parseFloat(auction.currentPrice || auction.startPrice || 0) + parseFloat(auction.bidStep || 0);

  return (
    <div className={`${styles.page} page-enter`}>
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={14} />
            Danh sách đấu giá
          </Link>
          <span className={styles.sep}>/</span>
          <span className={styles.currentPage}>{auction.title}</span>
        </div>

        <div className={styles.layout}>
          {/* Left: Image + Info */}
          <div className={styles.leftCol}>
            {/* Status Badge */}
            <div className={styles.statusRow}>
              <span className={`status-badge status-${auction.status}`}>
                {STATUS_LABEL[auction.status] || auction.status}
              </span>
              {isActive && (
                <div className={`${styles.countdown} ${isUrgent ? styles.countdownUrgent : ''}`}>
                  <Clock size={12} />
                  <span className="text-mono">{timeLeft}</span>
                </div>
              )}
            </div>

            {/* Image */}
            <div className={styles.imageContainer}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={auction.title}
                  className={styles.image}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <Gavel size={64} strokeWidth={1} />
                  <span>Không có hình ảnh</span>
                </div>
              )}
            </div>

            {/* Auction Info */}
            <div className={styles.infoCard}>
              <h1 className={styles.title}>{auction.title}</h1>
              {auction.description && (
                <p className={styles.description}>{auction.description}</p>
              )}

              <div className={styles.metaGrid}>
                {auction.startAt && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Bắt đầu</span>
                    <span className={styles.metaValue}>
                      {format(new Date(auction.startAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </span>
                  </div>
                )}
                {auction.endAt && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Kết thúc</span>
                    <span className={styles.metaValue}>
                      {format(new Date(auction.endAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </span>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Giá khởi điểm</span>
                  <span className={styles.metaValue}>{formatCurrency(auction.startPrice)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Bước giá tối thiểu</span>
                  <span className={styles.metaValue}>{formatCurrency(auction.bidStep)}</span>
                </div>
              </div>

              {auction.status === 'ENDED' && auction.winnerId && (
                <div className={styles.winnerBanner}>
                  <Trophy size={16} />
                  <span>Người thắng: <strong>{auction.winnerId}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Bid Panel */}
          <div className={styles.rightCol}>
            <div className={styles.bidPanel}>
              {/* Current Price */}
              <div className={styles.priceSection}>
                <div className={styles.priceLabelRow}>
                  <span className={styles.priceLabel}>Giá hiện tại</span>
                  {wsConnected && (
                    <span className={styles.liveDot} title="Đang cập nhật thời gian thực">
                      <span className={styles.liveDotPulse} />
                      LIVE
                    </span>
                  )}
                </div>
                <div ref={priceRef} className={`${styles.currentPrice} ${isActive ? styles.currentPriceActive : ''}`}>
                  {formatCurrency(auction.currentPrice || auction.startPrice)}
                </div>
                {auction.bidStep && (
                  <div className={styles.stepInfo}>
                    <TrendingUp size={12} />
                    <span>Bước giá tối thiểu: {formatCurrency(auction.bidStep)}</span>
                  </div>
                )}
              </div>

              <hr className="divider" />

              {/* Bid Form */}
              {canBid ? (
                <form onSubmit={handleBid} className={styles.bidForm} noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="bid-amount">
                      Giá thầu của bạn (VNĐ)
                    </label>
                    <div className={styles.bidInputWrapper}>
                      <input
                        id="bid-amount"
                        type="number"
                        min={minBid || 0}
                        step={auction.bidStep || 1}
                        value={bidAmount}
                        onChange={(e) => {
                          setBidAmount(e.target.value);
                          if (bidError) setBidError(null);
                        }}
                        placeholder={`Tối thiểu ${formatCurrency(minBid)}`}
                        className={`form-input ${bidError ? 'error' : ''}`}
                        required
                      />
                    </div>
                    {minBid > 0 && (
                      <span className="form-hint">
                        Giá tối thiểu: {formatCurrency(minBid)}
                      </span>
                    )}
                  </div>

                  {bidError && (
                    <ErrorAlert
                      message={bidError.message}
                      traceId={bidError.traceId}
                      onDismiss={() => setBidError(null)}
                    />
                  )}

                  {/* Quick bid buttons */}
                  {auction.bidStep && (
                    <div className={styles.quickBids}>
                      <span className={styles.quickLabel}>Nhanh:</span>
                      {[1, 2, 5].map((multiplier) => {
                        const amount = minBid + (parseFloat(auction.bidStep) * (multiplier - 1));
                        return (
                          <button
                            key={multiplier}
                            type="button"
                            className={`btn btn-outline btn-sm ${styles.quickBtn}`}
                            onClick={() => setBidAmount(String(amount))}
                            id={`btn-quick-bid-${multiplier}x`}
                          >
                            {formatCurrency(amount)}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="submit"
                    id="btn-place-bid"
                    className={`btn btn-primary btn-lg btn-full ${bidding ? 'btn-loading' : ''}`}
                    disabled={bidding || !bidAmount}
                  >
                    {!bidding && (
                      <>
                        <Gavel size={16} />
                        Đặt giá thầu
                      </>
                    )}
                  </button>

                  <div className={styles.bidNote}>
                    <ShieldCheck size={12} />
                    <span>Giao dịch được bảo mật và xác thực</span>
                  </div>
                </form>
              ) : auction.status === 'ACTIVE' && !isAuthenticated ? (
                <div className={styles.loginPrompt}>
                  <AlertCircle size={24} />
                  <p>Bạn cần đăng nhập để tham gia đấu giá</p>
                  <Link to="/login" className="btn btn-primary btn-lg btn-full" id="btn-login-to-bid">
                    Đăng nhập ngay
                  </Link>
                </div>
              ) : auction.status === 'ACTIVE' && isAdmin ? (
                <div className={styles.waitingState}>
                  <ShieldCheck size={24} />
                  <p>Admin không thể tham gia đấu giá</p>
                </div>
              ) : auction.status === 'APPROVED' ? (
                <div className={styles.waitingState}>
                  <Clock size={24} />
                  <p>Phiên đấu giá chưa bắt đầu</p>
                  {auction.startAt && (
                    <span className={styles.startInfo}>
                      Bắt đầu: {formatDistanceToNow(new Date(auction.startAt), { addSuffix: true, locale: vi })}
                    </span>
                  )}
                </div>
              ) : auction.status === 'ENDED' ? (
                <div className={styles.endedState}>
                  <Trophy size={24} />
                  <p>Phiên đấu giá đã kết thúc</p>
                  <span className={styles.finalPrice}>
                    Giá cuối: {formatCurrency(auction.currentPrice || auction.startPrice)}
                  </span>
                </div>
              ) : (
                <div className={styles.waitingState}>
                  <AlertCircle size={24} />
                  <p>Phiên đấu giá không khả dụng</p>
                </div>
              )}
            </div>

            {/* Admin Action Panel */}
            {isAdmin && (
              <div className={styles.adminPanel}>
                <h3 className={styles.adminPanelTitle}>Hành động Admin</h3>
                <div className={styles.adminActions}>
                  {/* DRAFT: edit + approve + cancel */}
                  {auction.status === 'DRAFT' && (
                    <>
                      <Link
                        to={`/admin/auctions/${id}/edit`}
                        className="btn btn-outline btn-full"
                        id="btn-admin-edit"
                      >
                        ✏️ Cập nhật thông tin
                      </Link>
                      <button
                        className={`btn btn-primary btn-full ${actionLoading === 'approve' ? 'btn-loading' : ''}`}
                        onClick={() => handleAdminAction('approve')}
                        disabled={!!actionLoading}
                        id="btn-admin-approve"
                      >
                        {actionLoading !== 'approve' && '✅ Duyệt sản phẩm'}
                      </button>
                      <button
                        className={`btn btn-outline btn-full ${actionLoading === 'cancel' ? 'btn-loading' : ''}`}
                        onClick={() => handleAdminAction('cancel')}
                        disabled={!!actionLoading}
                        id="btn-admin-cancel-draft"
                        style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                      >
                        {actionLoading !== 'cancel' && '🚫 Hủy sản phẩm'}
                      </button>
                    </>
                  )}

                  {/* APPROVED: start + cancel */}
                  {auction.status === 'APPROVED' && (
                    <>
                      <button
                        className={`btn btn-primary btn-full ${actionLoading === 'start' ? 'btn-loading' : ''}`}
                        onClick={() => handleAdminAction('start')}
                        disabled={!!actionLoading}
                        id="btn-admin-start"
                      >
                        {actionLoading !== 'start' && '🚀 Bắt đầu đấu giá'}
                      </button>
                      <button
                        className={`btn btn-outline btn-full ${actionLoading === 'cancel' ? 'btn-loading' : ''}`}
                        onClick={() => handleAdminAction('cancel')}
                        disabled={!!actionLoading}
                        id="btn-admin-cancel-approved"
                        style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                      >
                        {actionLoading !== 'cancel' && '🚫 Hủy sản phẩm'}
                      </button>
                    </>
                  )}

                  {/* ACTIVE: cancel only */}
                  {auction.status === 'ACTIVE' && (
                    <button
                      className={`btn btn-outline btn-full ${actionLoading === 'cancel' ? 'btn-loading' : ''}`}
                      onClick={() => handleAdminAction('cancel')}
                      disabled={!!actionLoading}
                      id="btn-admin-cancel-active"
                      style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                    >
                      {actionLoading !== 'cancel' && '🚫 Hủy đấu giá'}
                    </button>
                  )}

                  {/* ENDED / CANCELLED: no actions */}
                  {(auction.status === 'ENDED' || auction.status === 'CANCELLED') && (
                    <p className={styles.adminNoAction}>Phiên này đã kết thúc, không có hành động nào khả dụng.</p>
                  )}
                </div>
              </div>
            )}

            {/* Image metadata */}
            {auction.imageFileType && (
              <div className={styles.imageMeta}>
                <span className={styles.imageMetaItem}>
                  Định dạng: <strong>{auction.imageFileType}</strong>
                </span>
                {auction.imageSize && (
                  <span className={styles.imageMetaItem}>
                    Kích thước: <strong>{(auction.imageSize / 1024).toFixed(1)} KB</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className={`container ${styles.skeletonPage}`}>
      <div className={`skeleton ${styles.skeletonBreadcrumb}`} />
      <div className={styles.layout}>
        <div className={styles.leftCol}>
          <div className={`skeleton ${styles.skeletonImage}`} />
          <div className={styles.skeletonInfo}>
            <div className={`skeleton ${styles.skeletonTitle}`} />
            <div className={`skeleton ${styles.skeletonDesc}`} />
            <div className={`skeleton ${styles.skeletonDesc}`} />
          </div>
        </div>
        <div className={styles.rightCol}>
          <div className={`skeleton ${styles.skeletonPanel}`} />
        </div>
      </div>
    </div>
  );
}
