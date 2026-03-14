-- ============================================
-- 🔐 P0 SECURITY FIX: Production RLS Policies
-- Ngày: 14/03/2026
-- Mô tả: Xóa toàn bộ dev policies (USING true) thay bằng policies production
-- ============================================

-- 1. Helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_email()
RETURNS text AS $$
  SELECT email FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. XÓA TẤT CẢ dev policies
DROP POLICY IF EXISTS "bookings_delete_dev" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_dev" ON bookings;
DROP POLICY IF EXISTS "bookings_select_dev" ON bookings;
DROP POLICY IF EXISTS "bookings_update_dev" ON bookings;
DROP POLICY IF EXISTS "properties_delete_dev" ON properties;
DROP POLICY IF EXISTS "properties_insert_dev" ON properties;
DROP POLICY IF EXISTS "properties_update_dev" ON properties;
DROP POLICY IF EXISTS "reviews_delete_dev" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_dev" ON reviews;
DROP POLICY IF EXISTS "reviews_update_dev" ON reviews;
DROP POLICY IF EXISTS "users_delete_dev" ON users;
DROP POLICY IF EXISTS "users_insert_dev" ON users;
DROP POLICY IF EXISTS "users_select_dev" ON users;
DROP POLICY IF EXISTS "users_update_dev" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- 3. PROPERTIES
CREATE POLICY "properties_insert_admin" ON properties FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "properties_update_admin" ON properties FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "properties_delete_admin" ON properties FOR DELETE USING (public.is_admin());

-- 4. BOOKINGS
CREATE POLICY "bookings_select_public" ON bookings FOR SELECT USING (true);
CREATE POLICY "bookings_insert_auth" ON bookings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "bookings_update_own_or_admin" ON bookings FOR UPDATE 
  USING (guest_email = public.get_user_email() OR public.is_admin())
  WITH CHECK (guest_email = public.get_user_email() OR public.is_admin());
CREATE POLICY "bookings_delete_admin" ON bookings FOR DELETE USING (public.is_admin());

-- 5. USERS
CREATE POLICY "users_select_own_or_admin" ON users FOR SELECT USING (auth_id = auth.uid() OR public.is_admin());
CREATE POLICY "users_update_own_or_admin" ON users FOR UPDATE 
  USING (auth_id = auth.uid() OR public.is_admin())
  WITH CHECK (auth_id = auth.uid() OR public.is_admin());
CREATE POLICY "users_delete_admin" ON users FOR DELETE USING (public.is_admin());

-- 6. REVIEWS
CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "reviews_update_admin" ON reviews FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "reviews_delete_admin" ON reviews FOR DELETE USING (public.is_admin());
