import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionService } from '../../services/auctionService';
import ErrorAlert from '../../components/ErrorAlert/ErrorAlert';
import styles from './CreateAuctionPage.module.css';
import { Gavel, Upload, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateAuctionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startPrice: '',
    bidStep: '',
    startAt: '',
    endAt: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      // Backend expects the JSON part as "request"
      const requestBlob = new Blob(
        [JSON.stringify({
          title: form.title,
          description: form.description,
          startPrice: parseFloat(form.startPrice),
          bidStep: parseFloat(form.bidStep),
          startAt: form.startAt || null,
          endAt: form.endAt || null,
        })],
        { type: 'application/json' }
      );
      formData.append('request', requestBlob);
      if (imageFile) formData.append('file', imageFile);

      const result = await auctionService.createAuction(formData);
      toast.success('Đã tạo sản phẩm thành công!');
      navigate(`/admin/auctions`);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.page} page-enter`}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <button
            className={`btn btn-ghost btn-sm ${styles.back}`}
            onClick={() => navigate('/admin/auctions')}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className={styles.headerLabel}>
            <Gavel size={12} />
            <span>QUẢN LÝ ĐẤU GIÁ</span>
          </div>
          <h1 className={styles.title}>Thêm sản phẩm mới</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && (
            <ErrorAlert message={error.message} traceId={error.traceId} onDismiss={() => setError(null)} />
          )}

          <div className={styles.grid}>
            {/* Left column: fields */}
            <div className={styles.fields}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Tên sản phẩm *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-input"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Nhập tên sản phẩm"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết sản phẩm"
                  rows={4}
                />
              </div>

              <div className={styles.rowTwo}>
                <div className="form-group">
                  <label className="form-label" htmlFor="startPrice">Giá khởi điểm (VNĐ) *</label>
                  <input
                    id="startPrice"
                    name="startPrice"
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.startPrice}
                    onChange={handleChange}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="bidStep">Bước giá (VNĐ) *</label>
                  <input
                    id="bidStep"
                    name="bidStep"
                    type="number"
                    min="0"
                    className="form-input"
                    value={form.bidStep}
                    onChange={handleChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className={styles.rowTwo}>
                <div className="form-group">
                  <label className="form-label" htmlFor="startAt">Thời gian bắt đầu</label>
                  <input
                    id="startAt"
                    name="startAt"
                    type="datetime-local"
                    className="form-input"
                    value={form.startAt}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="endAt">Thời gian kết thúc</label>
                  <input
                    id="endAt"
                    name="endAt"
                    type="datetime-local"
                    className="form-input"
                    value={form.endAt}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Right column: image upload */}
            <div className={styles.imageSection}>
              <label className={styles.imageLabel}>Hình ảnh sản phẩm</label>
              <label htmlFor="image-upload" className={styles.uploadArea}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className={styles.preview} />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <Upload size={32} strokeWidth={1.5} />
                    <span>Nhấn để tải ảnh lên</span>
                    <small>JPG, PNG, WEBP (tối đa 5MB)</small>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/admin/auctions')}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              id="btn-submit-create"
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {!loading && <><Gavel size={16} /> Tạo sản phẩm</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
