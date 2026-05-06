import styles from './AuctionCard.module.css';
import { Link } from 'react-router-dom';
import { IMAGES_BASE_URL } from '../../config/api';
import { formatDistanceToNow, isPast } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Gavel, Clock, TrendingUp } from 'lucide-react';

const STATUS_LABEL = {
  DRAFT: 'Bản nháp',
  APPROVED: 'Đã duyệt',
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

function getTimeLabel(auction) {
  if (auction.status === 'ACTIVE' && auction.endAt) {
    const end = new Date(auction.endAt);
    if (isPast(end)) return 'Đã kết thúc';
    return `Còn ${formatDistanceToNow(end, { locale: vi })}`;
  }
  if (auction.status === 'APPROVED' && auction.startAt) {
    return `Bắt đầu ${formatDistanceToNow(new Date(auction.startAt), { addSuffix: true, locale: vi })}`;
  }
  return null;
}

export default function AuctionCard({ auction }) {
  const imageUrl = auction.imageUrl
    ? `${IMAGES_BASE_URL}${auction.imageUrl}`
    : null;
  const timeLabel = getTimeLabel(auction);
  const isActive = auction.status === 'ACTIVE';

  return (
    <Link to={`/auctions/${auction.id}`} className={styles.cardLink} id={`auction-card-${auction.id}`}>
      <article className={`card ${styles.card}`}>
        {/* Image */}
        <div className={styles.imageWrapper}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={auction.title}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <Gavel size={32} strokeWidth={1.5} />
            </div>
          )}
          <div className={styles.badgeOverlay}>
            <span className={`status-badge status-${auction.status}`}>
              {STATUS_LABEL[auction.status] || auction.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.title}>{auction.title}</h3>

          {auction.description && (
            <p className={styles.description}>{auction.description}</p>
          )}

          <div className={styles.priceRow}>
            <div className={styles.priceBlock}>
              <span className={styles.priceLabel}>Giá hiện tại</span>
              <span className={`${styles.price} ${isActive ? styles.priceActive : ''}`}>
                {formatCurrency(auction.currentPrice || auction.startPrice)}
              </span>
            </div>
            {auction.bidStep && (
              <div className={styles.bidStep}>
                <TrendingUp size={12} />
                <span>+{formatCurrency(auction.bidStep)}</span>
              </div>
            )}
          </div>

          {timeLabel && (
            <div className={`${styles.timer} ${isActive ? styles.timerActive : ''}`}>
              <Clock size={12} />
              <span>{timeLabel}</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
