-- ============================================
-- 🔧 BƯỚC 7: BỔ SUNG CỘT CHO BẢNG BOOKINGS
-- ============================================
-- Thêm cột payment_method và mở rộng trạng thái
-- ⚠️ Chạy file này trên Supabase SQL Editor TRƯỚC khi cập nhật code

-- Thêm cột phương thức thanh toán
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Chờ thanh toán';

-- Mở rộng trạng thái: thêm 'checked_in' và 'completed'
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled'));

-- Cập nhật payment_method cho dữ liệu mẫu đã có
UPDATE public.bookings SET payment_method = 'Chuyển khoản TPBank'
    WHERE id IN ('MP3X9K2A', 'MP2A8B4F');
UPDATE public.bookings SET payment_method = 'VNPay'
    WHERE id = 'MP5Z7N3C';
UPDATE public.bookings SET payment_method = 'Tiền mặt'
    WHERE id = 'MP7C3D9G';
UPDATE public.bookings SET payment_method = 'N/A'
    WHERE id = 'MP9X6K7E';
