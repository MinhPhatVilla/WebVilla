-- ============================================
-- 🏠 BƯỚC 1: TẠO BẢNG PROPERTIES
-- Lưu trữ thông tin Villa & Homestay
-- ============================================
-- Bảng này khớp với file: src/lib/property-store.tsx
-- Các cột map 1:1 với hàm rowToProperty() và propertyToRow()

CREATE TABLE IF NOT EXISTS public.properties (
    -- Khóa chính: dùng text ID thân thiện (slug)
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Thông tin cơ bản
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('villa', 'homestay')),
    description TEXT DEFAULT '',
    long_description TEXT DEFAULT '',
    
    -- Giá (đơn vị VND)
    price_weekday NUMERIC NOT NULL DEFAULT 0,
    price_weekend NUMERIC NOT NULL DEFAULT 0,
    
    -- Thuộc tính phòng
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms INTEGER DEFAULT 0,
    capacity INTEGER NOT NULL DEFAULT 2,
    
    -- Tiện ích (boolean)
    pool BOOLEAN DEFAULT false,
    bbq BOOLEAN DEFAULT false,
    wifi BOOLEAN DEFAULT false,
    parking BOOLEAN DEFAULT false,
    kitchen BOOLEAN DEFAULT false,
    aircon BOOLEAN DEFAULT false,
    karaoke BOOLEAN DEFAULT false,
    garden BOOLEAN DEFAULT false,
    
    -- Media
    images TEXT[] DEFAULT '{}',
    video_url TEXT DEFAULT '',
    
    -- Vị trí
    location TEXT DEFAULT '',
    address TEXT DEFAULT '',
    
    -- Đánh giá
    rating NUMERIC DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    
    -- Chính sách
    policies TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index để tìm kiếm nhanh theo loại
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);

-- Hàm tự động cập nhật updated_at khi sửa dữ liệu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger gọi hàm trên mỗi khi UPDATE
CREATE OR REPLACE TRIGGER trigger_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bật Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policy: Ai cũng có thể ĐỌC (khách xem danh sách)
CREATE POLICY "properties_select_public"
    ON public.properties FOR SELECT
    USING (true);

-- Policy: Cho phép INSERT (tạm thời cho development)
CREATE POLICY "properties_insert_dev"
    ON public.properties FOR INSERT
    WITH CHECK (true);

-- Policy: Cho phép UPDATE (tạm thời cho development)
CREATE POLICY "properties_update_dev"
    ON public.properties FOR UPDATE
    USING (true) WITH CHECK (true);

-- Policy: Cho phép DELETE (tạm thời cho development)
CREATE POLICY "properties_delete_dev"
    ON public.properties FOR DELETE
    USING (true);
