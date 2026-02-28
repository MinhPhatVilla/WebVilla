-- ============================================
-- 🔧 BƯỚC 8: BỔ SUNG CỘT CHO YÊU CẦU ĐỔI LỊCH
-- ============================================
-- Chạy file này trên Supabase SQL Editor TRƯỚC khi cập nhật code

ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS reschedule_requested BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS new_check_in DATE,
    ADD COLUMN IF NOT EXISTS new_check_out DATE;
