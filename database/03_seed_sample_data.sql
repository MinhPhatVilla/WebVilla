-- ============================================
-- 🎭 BƯỚC 3: CHÈN DỮ LIỆU MẪU
-- 6 nơi ở: 3 Villa + 3 Homestay
-- ============================================
-- Dữ liệu này lấy từ file src/lib/mock-data.ts
-- ⚠️ PHẢI chạy Bước 1 TRƯỚC khi chạy file này

-- ── 3 VILLA ──
INSERT INTO public.properties (
    id, name, type, description, long_description,
    price_weekday, price_weekend,
    bedrooms, bathrooms, capacity,
    pool, bbq, wifi, parking, kitchen, aircon, karaoke, garden,
    images, video_url, location, address,
    rating, reviews, policies
) VALUES
(
    'villa-ocean-view',
    'Villa Ocean View',
    'villa',
    'Biệt thự view biển tuyệt đẹp với hồ bơi tràn bờ, không gian sang trọng và tiện nghi đầy đủ.',
    'Villa Ocean View tọa lạc tại vị trí đắc địa ngay Bãi Sau Vũng Tàu, mang đến tầm nhìn biển 180 độ tuyệt đẹp. Với thiết kế hiện đại kết hợp phong cách nhiệt đới, villa sở hữu hồ bơi tràn bờ riêng, khu BBQ ngoài trời, phòng khách rộng rãi và 5 phòng ngủ sang trọng.',
    4000000, 6000000,
    5, 4, 15,
    true, true, true, true, true, true, true, true,
    ARRAY[
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop'
    ],
    'https://videos.pexels.com/video-files/7578552/7578552-uhd_2160_4096_30fps.mp4',
    'Bãi Sau, Vũng Tàu',
    '123 Trần Phú, Phường 5, TP. Vũng Tàu',
    5.0, 128,
    ARRAY['Nhận phòng từ 14:00', 'Trả phòng trước 12:00', 'Không hút thuốc trong nhà', 'Cọc 50% khi đặt', 'Đổi ngày miễn phí trước 10 ngày']
),
(
    'villa-garden-paradise',
    'Villa Garden Paradise',
    'villa',
    'Không gian xanh mát với vườn nhiệt đới, hồ bơi riêng và khu BBQ ngoài trời rộng rãi.',
    '',
    3500000, 5500000,
    4, 0, 12,
    true, true, false, false, false, false, false, false,
    ARRAY[
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop'
    ],
    '',
    'Thùy Vân, Vũng Tàu',
    '',
    4.9, 95,
    '{}'
),
(
    'villa-sunset-bay',
    'Villa Sunset Bay',
    'villa',
    'Ngắm hoàng hôn tuyệt đẹp từ ban công riêng, thiết kế hiện đại và tiện nghi cao cấp.',
    '',
    4500000, 7000000,
    6, 0, 20,
    true, true, false, false, false, false, false, false,
    ARRAY[
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=800&auto=format&fit=crop'
    ],
    '',
    'Bãi Trước, Vũng Tàu',
    '',
    4.8, 72,
    '{}'
);

-- ── 3 HOMESTAY ──
INSERT INTO public.properties (
    id, name, type, description, long_description,
    price_weekday, price_weekend,
    bedrooms, bathrooms, capacity,
    pool, bbq, wifi, parking, kitchen, aircon, karaoke, garden,
    images, video_url, location, address,
    rating, reviews, policies
) VALUES
(
    'homestay-cozy-nest',
    'Cozy Nest Homestay',
    'homestay',
    'Căn hộ ấm cúng, view biển đẹp, phù hợp cho cặp đôi hoặc gia đình nhỏ.',
    '',
    800000, 1200000,
    2, 0, 4,
    false, false, false, false, false, false, false, false,
    ARRAY[
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop'
    ],
    '',
    'Trung tâm Vũng Tàu',
    '',
    4.7, 156,
    '{}'
),
(
    'homestay-beach-front',
    'Beach Front Homestay',
    'homestay',
    'Ngay sát biển, thức dậy nghe sóng vỗ, không gian thoáng đãng và yên bình.',
    '',
    1000000, 1500000,
    3, 0, 6,
    false, true, false, false, false, false, false, false,
    ARRAY[
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=800&auto=format&fit=crop'
    ],
    '',
    'Bãi Sau, Vũng Tàu',
    '',
    4.6, 89,
    '{}'
),
(
    'homestay-mountain-view',
    'Mountain View Homestay',
    'homestay',
    'View núi Nhỏ tuyệt đẹp, yên tĩnh, thích hợp cho những ai muốn nghỉ ngơi thư giãn.',
    '',
    700000, 1000000,
    2, 0, 5,
    false, false, false, false, false, false, false, false,
    ARRAY[
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop'
    ],
    '',
    'Núi Nhỏ, Vũng Tàu',
    '',
    4.5, 64,
    '{}'
);
