-- ============================================
-- 👥 BƯỚC 4: TẠO BẢNG USERS
-- Quản lý người dùng (Admin, Nhân viên, Khách hàng)
-- ============================================
-- Bảng này phục vụ trang /admin/users
-- ⚠️ PHẢI chạy Bước 1 TRƯỚC khi chạy file này

-- Sequence cho user ID tự tăng (U001, U002, ...)
CREATE SEQUENCE IF NOT EXISTS user_id_seq START 11;

CREATE TABLE IF NOT EXISTS public.users (
    -- Khóa chính (tự sinh hoặc truyền thủ công)
    id TEXT PRIMARY KEY DEFAULT 'U' || lpad(nextval('user_id_seq')::text, 3, '0'),
    
    -- Thông tin cá nhân
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    
    -- Phân quyền: admin (quản trị), staff (nhân viên), customer (khách hàng)
    role TEXT NOT NULL DEFAULT 'customer'
        CHECK (role IN ('admin', 'staff', 'customer')),
    
    -- Trạng thái: active, inactive, banned
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'banned')),
    
    -- Thống kê
    bookings_count INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT now(),
    last_active TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index tìm kiếm
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Trigger tự cập nhật updated_at
CREATE OR REPLACE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bật Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Cho phép đọc (tạm thời dev)
CREATE POLICY "users_select_dev"
    ON public.users FOR SELECT
    USING (true);

-- Policy: Cho phép tạo (tạm thời dev)
CREATE POLICY "users_insert_dev"
    ON public.users FOR INSERT
    WITH CHECK (true);

-- Policy: Cho phép sửa (tạm thời dev)
CREATE POLICY "users_update_dev"
    ON public.users FOR UPDATE
    USING (true) WITH CHECK (true);

-- Policy: Cho phép xóa (tạm thời dev)
CREATE POLICY "users_delete_dev"
    ON public.users FOR DELETE
    USING (true);
