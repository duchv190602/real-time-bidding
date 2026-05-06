import { useState, useEffect, useCallback } from 'react';
import { auctionService } from '../../services/auctionService';
import AuctionCard from '../../components/AuctionCard/AuctionCard';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import styles from './HomePage.module.css';
import { Search, Filter, ChevronLeft, ChevronRight, Gavel } from 'lucide-react';

const STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Đang diễn ra' },
  { value: 'APPROVED', label: 'Sắp diễn ra' },
  { value: 'ENDED', label: 'Đã kết thúc' },
];

const PAGE_SIZE = 9;

export default function HomePage() {
  const [auctions, setAuctions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auctionService.getAuctions({
        page,
        size: PAGE_SIZE,
        status: status || undefined,
      });
      // Spring Page response: { content, totalPages, totalElements, number }
      setAuctions(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(0);
  };

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroLabel}>
                <Gavel size={12} />
                <span>PHIÊN ĐẤU GIÁ TRỰC TUYẾN</span>
              </div>
              <h1 className={styles.heroTitle}>
                Tìm Kiếm<br />
                <span className={styles.heroHighlight}>Cơ Hội</span> Của Bạn
              </h1>
              <p className={styles.heroSub}>
                {totalElements > 0
                  ? `${totalElements.toLocaleString('vi-VN')} phiên đấu giá đang chờ bạn`
                  : 'Khám phá các phiên đấu giá độc đáo'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.filterBar}>
            <div className={styles.filterLeft}>
              <Filter size={14} />
              <span className={styles.filterLabel}>Lọc theo:</span>
              <div className={styles.filterTabs}>
                {STATUSES.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`${styles.filterTab} ${status === value ? styles.filterTabActive : ''}`}
                    onClick={() => handleStatusChange(value)}
                    id={`filter-${value || 'all'}`}
                    aria-pressed={status === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {!loading && (
              <span className={styles.resultCount}>
                {totalElements} kết quả
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.main}>
        <div className="container">
          {error && (
            <ErrorAlert
              message={error.message}
              traceId={error.traceId}
              onDismiss={() => setError(null)}
            />
          )}

          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className={styles.empty}>
              <Gavel size={48} strokeWidth={1} />
              <h3>Không có phiên đấu giá nào</h3>
              <p>Thử chọn bộ lọc khác hoặc quay lại sau.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className={styles.pagination}>
              <button
                className={`btn btn-outline btn-sm ${styles.pageBtn}`}
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                id="btn-prev-page"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
                Trước
              </button>

              <div className={styles.pageInfo}>
                <span className={styles.pageNumber}>
                  Trang <strong>{page + 1}</strong> / {totalPages}
                </span>
              </div>

              <button
                className={`btn btn-outline btn-sm ${styles.pageBtn}`}
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                id="btn-next-page"
                aria-label="Trang sau"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={`skeleton ${styles.skeletonImage}`} />
      <div className={styles.skeletonContent}>
        <div className={`skeleton ${styles.skeletonTitle}`} />
        <div className={`skeleton ${styles.skeletonText}`} />
        <div className={`skeleton ${styles.skeletonPrice}`} />
      </div>
    </div>
  );
}
