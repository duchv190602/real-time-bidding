import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auctionService } from '../../services/auctionService';
import AuctionCard from '../../components/AuctionCard/AuctionCard';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import styles from './AdminAuctionListPage.module.css';
import { Search, Filter, ChevronLeft, ChevronRight, Gavel, Plus } from 'lucide-react';

const ALL_STATUSES = [
  { value: '', label: 'Tất cả' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'APPROVED', label: 'Sắp diễn ra' },
  { value: 'ACTIVE', label: 'Đang diễn ra' },
  { value: 'ENDED', label: 'Đã kết thúc' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const PAGE_SIZE = 9;

export default function AdminAuctionListPage() {
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
      const data = await auctionService.getAuctionsForAdmin({
        page,
        size: PAGE_SIZE,
        status: status || undefined,
      });
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
      {/* Header */}
      <section className={styles.header}>
        <div className="container">
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <div className={styles.headerLabel}>
                <Gavel size={12} />
                <span>QUẢN LÝ ĐẤU GIÁ</span>
              </div>
              <h1 className={styles.headerTitle}>Danh sách sản phẩm</h1>
              <p className={styles.headerSub}>
                {totalElements > 0
                  ? `${totalElements.toLocaleString('vi-VN')} sản phẩm`
                  : 'Quản lý tất cả phiên đấu giá'}
              </p>
            </div>
            <Link
              to="/admin/auctions/create"
              className="btn btn-primary"
              id="btn-create-auction"
              aria-label="Thêm sản phẩm mới"
            >
              <Plus size={16} />
              Thêm sản phẩm
            </Link>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className={styles.filterSection}>
        <div className="container">
          <div className={styles.filterBar}>
            <div className={styles.filterLeft}>
              <Filter size={14} />
              <span className={styles.filterLabel}>Trạng thái:</span>
              <div className={styles.filterTabs}>
                {ALL_STATUSES.map(({ value, label }) => (
                  <button
                    key={value}
                    className={`${styles.filterTab} ${status === value ? styles.filterTabActive : ''}`}
                    onClick={() => handleStatusChange(value)}
                    id={`admin-filter-${value || 'all'}`}
                    aria-pressed={status === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {!loading && (
              <span className={styles.resultCount}>{totalElements} kết quả</span>
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
              <h3>Không có sản phẩm nào</h3>
              <p>Thử chọn bộ lọc khác hoặc thêm sản phẩm mới.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {auctions.map((auction) => (
                <div key={auction.id} className={styles.cardWrapper}>
                  <AuctionCard auction={auction} />
                  <Link
                    to={`/admin/auctions/${auction.id}/edit`}
                    className={`btn btn-outline btn-sm ${styles.editBtn}`}
                    id={`btn-edit-${auction.id}`}
                    aria-label={`Sửa ${auction.title}`}
                  >
                    Sửa
                  </Link>
                </div>
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
                id="admin-btn-prev-page"
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
                id="admin-btn-next-page"
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
