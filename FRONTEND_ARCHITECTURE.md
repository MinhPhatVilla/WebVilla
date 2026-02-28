# 📋 TÀI LIỆU KIẾN TRÚC FRONTEND - MINH PHÁT VILLA

> **Phiên bản:** 1.0  
> **Ngày cập nhật:** 29/01/2026  
> **Người viết:** Member 2 (Frontend & Creative)

---

## 📁 CẤU TRÚC THƯ MỤC

```
WebVilla/
├── public/                    # File tĩnh (logo, favicon, ảnh)
│   └── logo.png              # Logo chính của website
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Layout chung (font, meta tags)
│   │   ├── page.tsx          # Trang chủ (Villa/Homestay listing)
│   │   ├── globals.css       # CSS toàn cục + Tailwind
│   │   └── villa/[id]/       # [Cần tạo] Trang chi tiết villa
│   │       └── page.tsx
│   ├── components/
│   │   ├── villa/
│   │   │   ├── HeroSection.tsx      # Slider ảnh + Video dọc
│   │   │   └── BookingCalendar.tsx  # Lịch chọn ngày
│   │   ├── layout/            # [Cần tạo] Header, Footer tái sử dụng
│   │   └── ui/                # Các component UI cơ bản (Button, Card...)
│   ├── lib/
│   │   └── mock-data.ts       # ⚠️ DỮ LIỆU GIẢ - Cần thay bằng API thật
│   └── sanity/                # Cấu hình Sanity CMS
├── tailwind.config.ts         # Cấu hình màu sắc, font
├── next.config.mjs            # Cấu hình Next.js (domain ảnh cho phép)
└── package.json               # Dependencies
```

---

## 🎨 HỆ THỐNG THIẾT KẾ (Design System)

### Bảng Màu Chủ Đạo

| Tên | Mã Màu | Sử Dụng |
|-----|--------|---------|
| **Primary (Xanh đậm)** | `#0F172A` | Nút chính, tiêu đề quan trọng |
| **Primary Light** | `#1E293B` | Hover state |
| **Cyan** | `#06B6D4` → `#0284C7` | Gradient, badge, tab active |
| **Gold** | `#D4AF37` | Điểm nhấn cao cấp |
| **Gray** | `#F9FAFB` → `#111827` | Nền, text |

### Typography (Font Chữ)

- **Font chính:** `Outfit` (Google Fonts) - Modern, Clean
- **Tiêu đề:** `font-extrabold` hoặc `font-bold`
- **Nội dung:** `font-medium` hoặc `font-normal`

### Border Radius

- **Card lớn:** `rounded-3xl` (24px)
- **Button:** `rounded-full` hoặc `rounded-xl`
- **Input:** `rounded-lg`

---

## 📊 CẤU TRÚC DỮ LIỆU (Data Schema)

### Interface `Property` (Villa & Homestay)

```typescript
interface Property {
    id: string;                    // ID duy nhất (slug-friendly)
    name: string;                  // Tên căn
    type: 'villa' | 'homestay';    // Loại hình
    description: string;           // Mô tả ngắn
    price: {
        weekday: number;           // Giá ngày thường (VND)
        weekend: number;           // Giá cuối tuần (VND)
    };
    attributes: {
        bedrooms: number;          // Số phòng ngủ
        capacity: number;          // Sức chứa (người)
        pool: boolean;             // Có hồ bơi?
        bbq: boolean;              // Có khu BBQ?
    };
    images: string[];              // Mảng URL ảnh
    videoUrl: string;              // URL video dọc (TikTok style)
    location: string;              // Vị trí
    rating: number;                // Điểm đánh giá (1-5)
    reviews: number;               // Số lượt đánh giá
}
```

### 📌 YÊU CẦU CHO MEMBER 1 (Backend/CMS)

1. **Tạo Schema Sanity CMS** theo cấu trúc `Property` ở trên
2. **API Endpoints cần thiết:**
   - `GET /api/properties` - Lấy danh sách tất cả
   - `GET /api/properties?type=villa` - Lọc theo loại
   - `GET /api/properties/[id]` - Chi tiết 1 căn
   - `GET /api/availability/[id]` - Lịch trống của căn
3. **Xử lý ảnh:** Upload lên Sanity CDN, trả về URL
4. **Xử lý video:** Lưu URL video từ YouTube/Pexels hoặc tự host

---

## 🔐 YÊU CẦU BẢO MẬT (Cho Member 1 & Member 3)

### Môi Trường (Environment Variables)

File `.env.local` cần có:

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=xxx              # ⚠️ KHÔNG commit lên Git

# Google Maps (nếu dùng)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx

# Zalo OA (nếu tích hợp chat)
ZALO_OA_ACCESS_TOKEN=xxx          # ⚠️ Server-side only
```

### Quy Tắc Bảo Mật

1. **KHÔNG** lưu API key trong code frontend
2. **KHÔNG** expose Sanity write token ra client
3. Dùng `NEXT_PUBLIC_` prefix cho biến cần ở browser
4. Biến nhạy cảm chỉ dùng trong API routes (`/api/*`)

---

## 🔗 CÁCH TÍCH HỢP BACKEND

### Bước 1: Thay Mock Data bằng API Call

**File hiện tại:** `src/lib/mock-data.ts`

**Thay bằng:** `src/lib/api.ts`

```typescript
// src/lib/api.ts
import { client } from '@/sanity/lib/client';

export async function getProperties(type?: 'villa' | 'homestay') {
    const filter = type ? `&& type == "${type}"` : '';
    return await client.fetch(`
        *[_type == "property" ${filter}] {
            _id,
            name,
            type,
            description,
            "price": price { weekday, weekend },
            // ... mapping fields
        }
    `);
}
```

### Bước 2: Cập nhật Component

```tsx
// src/app/page.tsx
import { getProperties } from '@/lib/api';

export default async function HomePage() {
    const villas = await getProperties('villa');
    const homestays = await getProperties('homestay');
    
    // ... render
}
```

---

## 📅 TÍCH HỢP LỊCH ĐẶT PHÒNG

### Yêu Cầu Cho Backend

1. **Schema `Booking`:**
```typescript
interface Booking {
    propertyId: string;    // ID căn
    checkIn: Date;         // Ngày nhận phòng
    checkOut: Date;        // Ngày trả phòng
    status: 'pending' | 'confirmed' | 'cancelled';
    customerName: string;
    customerPhone: string;
}
```

2. **API Endpoint:**
   - `GET /api/availability/[propertyId]?month=2026-01` → Trả về mảng ngày đã đặt

### Frontend Sử Dụng

```tsx
// BookingCalendar.tsx sẽ gọi API này
const bookedDates = await fetch(`/api/availability/${propertyId}?month=2026-01`);
// Trả về: ["2026-01-20", "2026-01-21", "2026-01-22"]
```

---

## 🗺️ TÍCH HỢP BẢN ĐỒ

### Option 1: Google Maps Embed (Đơn giản)

```tsx
<iframe
    src={`https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${location}`}
    width="100%"
    height="300"
    style={{ border: 0 }}
    loading="lazy"
/>
```

### Option 2: React Google Maps (Nâng cao)

```bash
npm install @react-google-maps/api
```

---

## ✅ CHECKLIST HOÀN THÀNH

### Frontend (Member 2) ✅
- [x] Trang chủ với tabs Villa/Homestay
- [x] Card hiển thị thông tin căn
- [x] Layout responsive
- [x] Hero Section với slider
- [x] Placeholder cho Lịch & Map
- [ ] Trang chi tiết từng căn
- [ ] Form đặt phòng
- [ ] Responsive mobile menu

### Backend (Member 1) ⏳
- [ ] Schema Sanity CMS
- [ ] API endpoints
- [ ] Upload/quản lý media
- [ ] API lịch đặt phòng

### AI & Bảo Mật (Member 3) ⏳
- [ ] Chatbot tư vấn
- [ ] Rate limiting API
- [ ] Input validation
- [ ] CORS configuration

---

## 📞 LIÊN HỆ HỖ TRỢ

Nếu có thắc mắc về Frontend, liên hệ **Member 2** qua:
- Zalo nhóm dự án
- Comment trực tiếp trong file này

---

*Tài liệu này được tạo tự động bởi Antigravity AI Assistant*
