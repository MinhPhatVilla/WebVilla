-- ============================================
-- 📊 BƯỚC 5: TẠO BẢNG REVIEWS
-- Đánh giá của khách hàng
-- ============================================
-- Dùng cho tính năng hiển thị review trên trang chi tiết
-- ⚠️ PHẢI chạy Bước 1 TRƯỚC khi chạy file này

CREATE TABLE IF NOT EXISTS public.reviews (
    -- Khóa chính
    id SERIAL PRIMARY KEY,
    
    -- Liên kết property
    property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    
    -- Thông tin người đánh giá
    guest_name TEXT NOT NULL,
    guest_avatar TEXT DEFAULT '',
    
    -- Nội dung đánh giá
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    
    -- Hình ảnh đính kèm (nếu có)
    images TEXT[] DEFAULT '{}',
    
    -- Trạng thái: approved (hiển thị), pending (chờ duyệt), hidden (ẩn)
    status TEXT NOT NULL DEFAULT 'approved'
        CHECK (status IN ('approved', 'pending', 'hidden')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_property ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Trigger tự cập nhật updated_at
CREATE OR REPLACE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bật Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Ai cũng có thể đọc review đã duyệt
CREATE POLICY "reviews_select_public"
    ON public.reviews FOR SELECT
    USING (true);

-- Policy: Cho phép tạo review (tạm thời dev)
CREATE POLICY "reviews_insert_dev"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

-- Policy: Cho phép sửa (tạm thời dev)
CREATE POLICY "reviews_update_dev"
    ON public.reviews FOR UPDATE
    USING (true) WITH CHECK (true);

-- Policy: Cho phép xóa (tạm thời dev)
CREATE POLICY "reviews_delete_dev"
    ON public.reviews FOR DELETE
    USING (true);
