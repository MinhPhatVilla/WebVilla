-- ============================================
-- 🏠 CẬP NHẬT BẢNG PROPERTIES
-- Thêm cột is_contact_for_price để tuỳ chọn hiển thị "Liên hệ báo giá" thay vì giá cụ thể
-- ============================================

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_contact_for_price BOOLEAN DEFAULT false;
