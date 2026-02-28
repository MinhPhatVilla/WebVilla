-- ============================================
-- 📝 BƯỚC 2: TẠO BẢNG BOOKINGS
-- Lưu trữ đơn đặt phòng
-- ============================================
-- Bảng này liên kết với bảng properties qua property_id
-- ⚠️ PHẢI chạy Bước 1 (tạo bảng properties) TRƯỚC khi chạy file này

CREATE TABLE IF NOT EXISTS public.bookings (
    -- Khóa chính: mã đơn tự sinh dạng "MP" + 6 ký tự
    id TEXT PRIMARY KEY DEFAULT 'MP' || upper(substr(md5(random()::text), 1, 6)),
    
    -- Liên kết đến property nào
    property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    property_name TEXT NOT NULL,
    
    -- Thông tin khách hàng
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_email TEXT DEFAULT '',
    guest_count INTEGER NOT NULL DEFAULT 1,
    
    -- Ngày nhận phòng / trả phòng
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    
    -- Chi phí (đơn vị VND)
    total_price NUMERIC NOT NULL DEFAULT 0,
    deposit_amount NUMERIC DEFAULT 0,
    
    -- Trạng thái đơn
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    
    -- Ghi chú thêm
    notes TEXT DEFAULT '',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_bookings_property ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON public.bookings(check_in);

-- Trigger tự cập nhật updated_at
CREATE OR REPLACE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bật Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép đọc (tạm thời dev)
CREATE POLICY "bookings_select_dev"
    ON public.bookings FOR SELECT
    USING (true);

-- Policy: Cho phép tạo (tạm thời dev)
CREATE POLICY "bookings_insert_dev"
    ON public.bookings FOR INSERT
    WITH CHECK (true);

-- Policy: Cho phép sửa (tạm thời dev)
CREATE POLICY "bookings_update_dev"
    ON public.bookings FOR UPDATE
    USING (true) WITH CHECK (true);

-- Policy: Cho phép xóa (tạm thời dev)
CREATE POLICY "bookings_delete_dev"
    ON public.bookings FOR DELETE
    USING (true);
