-- ============================================
-- 📝 BƯỚC 6B: CHÈN LẠI PROPERTIES BỊ THIẾU + BOOKINGS
-- ============================================
-- File này sẽ chèn lại các property bị thiếu (nếu có)
-- rồi mới chèn bookings

-- Trước tiên, kiểm tra và chèn lại properties bị thiếu
-- Dùng ON CONFLICT DO NOTHING để không bị lỗi nếu đã tồn tại
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
    'Villa Ocean View tọa lạc tại vị trí đắc địa ngay Bãi Sau Vũng Tàu, mang đến tầm nhìn biển 180 độ tuyệt đẹp.',
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
),
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
)
ON CONFLICT (id) DO NOTHING;

-- Bây giờ chèn bookings (properties đã chắc chắn tồn tại)
INSERT INTO public.bookings (id, property_id, property_name, guest_name, guest_phone, guest_email, guest_count, check_in, check_out, total_price, deposit_amount, status, notes)
VALUES
    ('MP3X9K2A', 'villa-ocean-view', 'Villa Ocean View', 'Nguyễn Văn Tuấn', '0912345678', 'tuan@email.com', 8, '2026-03-01', '2026-03-05', 16000000, 8000000, 'confirmed', 'Đến muộn lúc 18h'),
    ('MP8Y2L1B', 'homestay-cozy-nest', 'Cozy Nest Homestay', 'Trần Thị Mai', '0987654321', 'mai@email.com', 3, '2026-02-28', '2026-03-02', 2400000, 1200000, 'pending', ''),
    ('MP5Z7N3C', 'villa-sunset-bay', 'Villa Sunset Bay', 'Lê Hoàng Phúc', '0901234567', 'phuc@email.com', 12, '2026-03-05', '2026-03-08', 13500000, 6750000, 'confirmed', ''),
    ('MP1W4M5D', 'homestay-beach-front', 'Beach Front Homestay', 'Phạm Minh Anh', '0976543210', 'minh.anh@email.com', 4, '2026-03-10', '2026-03-12', 3000000, 1500000, 'pending', 'Cần cũi em bé'),
    ('MP9X6K7E', 'villa-garden-paradise', 'Villa Garden Paradise', 'Võ Thanh Sơn', '0934567890', 'son@email.com', 10, '2026-03-15', '2026-03-18', 10500000, 5250000, 'cancelled', 'Đã yêu cầu hoàn cọc'),
    ('MP2A8B4F', 'villa-ocean-view', 'Villa Ocean View', 'Ngô Thị Hương', '0965432109', '', 6, '2026-02-24', '2026-02-26', 8000000, 4000000, 'confirmed', ''),
    ('MP7C3D9G', 'homestay-mountain-view', 'Mountain View Homestay', 'Đặng Quốc Bảo', '0943218765', 'bao@email.com', 4, '2026-02-20', '2026-02-22', 1400000, 700000, 'confirmed', '')
ON CONFLICT (id) DO NOTHING;
