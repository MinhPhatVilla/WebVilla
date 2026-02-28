-- ============================================
-- 🏠 CẬP NHẬT BẢNG PROPERTIES
-- Thêm cột beds để quản lý số lượng giường
-- ============================================

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS beds INTEGER DEFAULT 1;
