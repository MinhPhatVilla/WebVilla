# 🏠 HƯỚNG DẪN CÀI ĐẶT SANITY CMS (Admin Panel)

## Bước 1: Tạo Tài Khoản Sanity

1. Truy cập: https://www.sanity.io/
2. Đăng ký tài khoản miễn phí (có thể dùng Google/GitHub)
3. Tạo Project mới:
   - Tên: `minh-phat-villa`
   - Dataset: `production`

## Bước 2: Lấy Project ID

1. Sau khi tạo project, vào Dashboard
2. Vào Settings → API → Project ID
3. Copy Project ID (dạng: `abc123xyz`)

## Bước 3: Cập Nhật File .env.local

Mở file `.env.local` và điền:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz    # Thay bằng Project ID của bạn
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

## Bước 4: Khởi Động Lại Server

```bash
# Dừng server cũ (Ctrl + C)
npm run dev
```

## Bước 5: Truy Cập Admin Panel

Mở trình duyệt: **http://localhost:3000/studio**

Đăng nhập bằng tài khoản Sanity đã tạo.

---

## 📋 CHỨC NĂNG ADMIN

### 🏠 Căn Hộ / Villa
- Thêm/sửa/xóa căn Villa hoặc Homestay
- Upload ảnh đại diện + bộ sưu tập ảnh
- Dán link video TikTok/YouTube
- Cài đặt giá ngày thường/cuối tuần/lễ tết
- Chọn tiện nghi (hồ bơi, BBQ, wifi...)
- Thêm vị trí Google Maps

### 📝 Đơn Đặt Phòng
- Xem tất cả đơn đặt
- Theo dõi trạng thái: Chờ xác nhận → Đã xác nhận → Đã thanh toán
- Thông tin khách hàng + ghi chú

### 📅 Lịch Phòng Trống
- Đánh dấu ngày đã đặt / còn trống / khóa phòng
- Xem theo từng căn

### 💰 Giá Theo Ngày
- Đặt giá đặc biệt cho ngày cụ thể
- VD: Tết Nguyên Đán, 30/4, khuyến mãi...

---

## ❓ LỖI THƯỜNG GẶP

### "Invalid project ID"
→ Kiểm tra lại `NEXT_PUBLIC_SANITY_PROJECT_ID` trong `.env.local`

### Không thấy nội dung
→ Kiểm tra dataset phải là `production`

### Không upload được ảnh
→ Vào Sanity Dashboard → Settings → API → CORS Origins
→ Thêm: `http://localhost:3000`

---

*Tạo bởi Antigravity AI - Ngày 31/01/2026*
