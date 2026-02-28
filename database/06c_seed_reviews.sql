-- ============================================
-- ⭐ BƯỚC 6C: CHÈN DỮ LIỆU MẪU — REVIEWS
-- ============================================
-- Chạy sau khi 06b thành công

INSERT INTO public.reviews (property_id, guest_name, guest_avatar, rating, comment, status)
VALUES
    -- Villa Ocean View (4 review)
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

    -- Mountain View Homestay (1 review)
    ('homestay-mountain-view', 'Đặng Quốc Bảo', 'ĐB', 4, 'View núi Nhỏ đẹp, yên tĩnh. Thích hợp nghỉ ngơi cuối tuần.', 'pending');
