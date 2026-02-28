-- ============================================
-- 🎭 BƯỚC 6: CHÈN DỮ LIỆU MẪU CHO USERS, BOOKINGS, REVIEWS
-- ============================================
-- ⚠️ PHẢI chạy Bước 1, 2, 4, 5 TRƯỚC khi chạy file này

-- ───────────────────────────────────
-- 👥 DỮ LIỆU MẪU: USERS (10 người)
-- ───────────────────────────────────

INSERT INTO public.users (id, name, email, phone, avatar, role, status, bookings_count, total_spent, joined_at, last_active)
VALUES
    ('U001', 'Ngô Minh Phát', 'phat@minhphatvilla.com', '0333160365', 'MP', 'admin', 'active', 0, 0, '2025-01-01', '2026-02-24'),
    ('U002', 'Nguyễn Văn Long', 'long@minhphatvilla.com', '0912345678', 'NL', 'staff', 'active', 0, 0, '2025-03-15', '2026-02-23'),
    ('U003', 'Trần Minh Tâm', 'tam@minhphatvilla.com', '0987654321', 'TT', 'staff', 'active', 0, 0, '2025-06-01', '2026-02-22'),
    ('U004', 'Nguyễn Văn Tuấn', 'tuan@email.com', '0912345678', 'NT', 'customer', 'active', 3, 42000000, '2025-08-10', '2026-02-20'),
    ('U005', 'Trần Thị Mai', 'mai@email.com', '0987654321', 'TM', 'customer', 'active', 2, 7200000, '2025-09-05', '2026-02-22'),
    ('U006', 'Lê Hoàng Phúc', 'phuc@email.com', '0901234567', 'LP', 'customer', 'active', 5, 68000000, '2025-05-20', '2026-02-18'),
    ('U007', 'Phạm Minh Anh', 'minh.anh@email.com', '0976543210', 'PA', 'customer', 'active', 1, 3000000, '2025-11-12', '2026-02-23'),
    ('U008', 'Võ Thanh Sơn', 'son@email.com', '0934567890', 'VS', 'customer', 'banned', 1, 0, '2025-10-01', '2026-01-15'),
    ('U009', 'Ngô Thị Hương', 'huong@email.com', '0965432109', 'NH', 'customer', 'active', 4, 32000000, '2025-04-18', '2026-02-24'),
    ('U010', 'Đặng Quốc Bảo', 'bao@email.com', '0943218765', 'ĐB', 'customer', 'inactive', 1, 1400000, '2025-12-01', '2026-01-28');

-- ───────────────────────────────────
-- 📝 DỮ LIỆU MẪU: BOOKINGS (7 đơn)
-- ───────────────────────────────────

INSERT INTO public.bookings (id, property_id, property_name, guest_name, guest_phone, guest_email, guest_count, check_in, check_out, total_price, deposit_amount, status, notes)
VALUES
    ('MP3X9K2A', 'villa-ocean-view', 'Villa Ocean View', 'Nguyễn Văn Tuấn', '0912345678', 'tuan@email.com', 8, '2026-03-01', '2026-03-05', 16000000, 8000000, 'confirmed', 'Đến muộn lúc 18h'),
    ('MP8Y2L1B', 'homestay-cozy-nest', 'Cozy Nest Homestay', 'Trần Thị Mai', '0987654321', 'mai@email.com', 3, '2026-02-28', '2026-03-02', 2400000, 1200000, 'pending', ''),
    ('MP5Z7N3C', 'villa-sunset-bay', 'Villa Sunset Bay', 'Lê Hoàng Phúc', '0901234567', 'phuc@email.com', 12, '2026-03-05', '2026-03-08', 13500000, 6750000, 'confirmed', ''),
    ('MP1W4M5D', 'homestay-beach-front', 'Beach Front Homestay', 'Phạm Minh Anh', '0976543210', 'minh.anh@email.com', 4, '2026-03-10', '2026-03-12', 3000000, 1500000, 'pending', 'Cần cũi em bé'),
    ('MP9X6K7E', 'villa-garden-paradise', 'Villa Garden Paradise', 'Võ Thanh Sơn', '0934567890', 'son@email.com', 10, '2026-03-15', '2026-03-18', 10500000, 5250000, 'cancelled', 'Đã yêu cầu hoàn cọc'),
    ('MP2A8B4F', 'villa-ocean-view', 'Villa Ocean View', 'Ngô Thị Hương', '0965432109', '', 6, '2026-02-24', '2026-02-26', 8000000, 4000000, 'confirmed', ''),
    ('MP7C3D9G', 'homestay-mountain-view', 'Mountain View Homestay', 'Đặng Quốc Bảo', '0943218765', 'bao@email.com', 4, '2026-02-20', '2026-02-22', 1400000, 700000, 'confirmed', '');

-- ───────────────────────────────────
-- ⭐ DỮ LIỆU MẪU: REVIEWS (12 đánh giá)
-- ───────────────────────────────────

INSERT INTO public.reviews (property_id, guest_name, guest_avatar, rating, comment, status)
VALUES
    -- Villa Ocean View (5 review)
    ('villa-ocean-view', 'Nguyễn Văn Tuấn', 'NT', 5, 'Villa rất đẹp, hồ bơi sạch sẽ, view biển tuyệt vời! Gia đình tôi rất hài lòng. Chắc chắn sẽ quay lại!', 'approved'),
    ('villa-ocean-view', 'Ngô Thị Hương', 'NH', 5, 'Không gian sang trọng, tiện nghi đầy đủ. Chủ nhà rất thân thiện. 10/10!', 'approved'),
    ('villa-ocean-view', 'Trần Minh Khoa', 'TK', 5, 'Tuyệt vời cho nhóm bạn đi chơi. Khu BBQ rộng rãi, karaoke chất lượng.', 'approved'),
    ('villa-ocean-view', 'Lê Thu Hà', 'LH', 4, 'Villa đẹp, chỉ hơi xa trung tâm một chút. Nhưng view bù lại tất cả!', 'approved'),

    -- Villa Garden Paradise (3 review)
    ('villa-garden-paradise', 'Phạm Thanh Nhàn', 'PN', 5, 'Vườn cây xanh mát, cảm giác như resort 5 sao. Rất thích!', 'approved'),
    ('villa-garden-paradise', 'Hoàng Minh Đức', 'HĐ', 5, 'Hồ bơi riêng tuyệt vời, không gian yên tĩnh. Perfect!', 'approved'),
    ('villa-garden-paradise', 'Nguyễn Thu Trang', 'NT', 4, 'Đẹp lắm, BBQ buổi tối rất vui. Giá hợp lý cho nhóm đông.', 'approved'),

    -- Villa Sunset Bay (2 review)
    ('villa-sunset-bay', 'Lê Hoàng Phúc', 'LP', 5, 'Hoàng hôn từ ban công đẹp mê li! Villa cao cấp, đáng đồng tiền.', 'approved'),
    ('villa-sunset-bay', 'Võ Minh Quân', 'VQ', 4, 'View đẹp, phòng rộng. Phù hợp cho gia đình đông người.', 'approved'),

    -- Cozy Nest Homestay (1 review)
    ('homestay-cozy-nest', 'Trần Thị Mai', 'TM', 5, 'Homestay ấm cúng, gọn gàng. Giá rẻ mà chất lượng tốt!', 'approved'),

    -- Beach Front Homestay (1 review)
    ('homestay-beach-front', 'Đỗ Quang Huy', 'ĐH', 4, 'Ngay sát biển, tiện lắm. Buổi sáng chạy bộ dọc bãi biển rất thích.', 'approved'),

    -- Mountain View Homestay (1 review - pending)
    ('homestay-mountain-view', 'Đặng Quốc Bảo', 'ĐB', 4, 'View núi Nhỏ đẹp, yên tĩnh. Thích hợp nghỉ ngơi cuối tuần.', 'pending');
