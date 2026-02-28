-- ============================================
-- 🔐 BƯỚC 8: ĐỒNG BỘ SUPABASE AUTH → PUBLIC.USERS (v2 - FIX CONFLICT)
-- ============================================
-- Khi khách đăng ký tài khoản → tự động tạo record trong bảng users
-- Nếu email đã tồn tại → cập nhật auth_id thay vì báo lỗi

-- Thêm cột auth_id để liên kết với auth.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- Tạo function xử lý khi có user mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu email đã có trong users → chỉ cập nhật auth_id
    -- Nếu chưa có → tạo mới
    INSERT INTO public.users (name, email, phone, role, status, avatar, auth_id, joined_at, last_active)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        'customer',
        'active',
        UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 2)),
        NEW.id,
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        auth_id = EXCLUDED.auth_id,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        last_active = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tạo trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- RLS policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth_id = auth.uid() OR true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth_id = auth.uid());
