-- ============================================
-- 🔧 BƯỚC 9: THÔNG TIN SỐ LẦN DỜI LỊCH
-- ============================================
-- Chạy file này trên Supabase SQL Editor TRƯỚC khi cập nhật code

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS reschedule_count INTEGER DEFAULT 0;
