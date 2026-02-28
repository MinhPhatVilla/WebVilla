-- ============================================
-- 👥 BƯỚC 6A: CHÈN DỮ LIỆU MẪU — USERS
-- ============================================
-- Chạy riêng phần này trước

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
