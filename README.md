# 🏠 MINH PHÁT VILLA - Website Đặt Phòng Villa & Homestay

> **Phiên bản:** 0.3.4  
> **Ngày cập nhật:** 28/02/2026  
> **Ngôn ngữ giao diện:** Tiếng Việt  
> **Trạng thái:** Đang phát triển

---

## 🌟 Mới Nhất: Định Toán "Cuối Tuần", Cấn Trừ Cọc & Bot Telegram (v0.3.4)

**Tính năng đã hoàn thành:**
- **Tính năng "Liên hệ báo giá" (Contact For Price):**
  - Thêm Checkbox cấu hình căn "Liên hệ Zalo" trên Admin, cho phép nhập Tạm tính Ngày thường/Thứ 7.
  - UI Khách hàng ẩn nút đặt phòng, thay bằng Box "Khoảng giá tham khảo" báo giá min/max.
- **Thuật toán "Cuối Tuần" đặc thù Vũng Tàu (Weekend Logic):**
  - Đổi định nghĩa: **Chỉ duy nhất Thứ 7** được xem là cuối tuần. Chủ Nhật áp dụng giá Ngày thường (CN-T6).
  - Update Lịch chọn ngày (Admin + Khách hàng): Chỉ highlight cột Thứ 7 (Màu đỏ/hồng).
- **Tối ưu trải nghiệm Dời lịch (Reschedule Deposit Logic):**
  - Giữ nguyên tiền cọc của khách hàng (không yêu cầu cọc bổ sung khi thay đổi ngày).
  - Tích hợp "Bảng tạm tính" realtime vào Modal Dời Lịch: Tự báo `Còn thanh toán lúc Check-in` hoặc `Số dư hoàn trả tại Villa` tuỳ thuộc vào chênh lệch (Ví dụ dời từ Thứ 7 -> Ngày thường sẽ dư tiền cọc).
- **Tích hợp Thông Báo Đa Nền Tảng (Telegram Bot):**
  - Xây dựng Route trung gian Next.js để kết nối HTTPS `api.telegram.org`.
  - Admin (Điện thoại) tự động reo chuông nhận tin nhắn: 🚨 Khi có Booking Mới, 🔄 Khi có yêu cầu thay đổi lịch trình.

**Files đã tạo mới / chỉnh sửa:**
- `src/app/api/telegram/route.ts` (Tạo Backend Route kết nối Bot Telegram).
- `src/app/admin/properties/AddPropertyModal.tsx` (Thêm Input dự kiến báo giá, dọn logic isWeekend).
- `src/app/admin/properties/page.tsx` (Update UI lịch bôi đỏ Thứ 7).
- `src/app/[type]/[id]/page.tsx` (Áp dụng Contact for Price UI và Custom Calendar).
- `src/app/trips/page.tsx` (Thêm Bảng Preview Cấn trừ cọc, tích hợp alert qua Telegram).
- `src/app/checkout/page.tsx` (Tính toán nights chuẩn ngày + Gắn alert Telegram lúc chốt đơn).

**Ghi chú quan trọng cho lần sau:**
- Cần tối ưu thêm việc cấp quyền cho Quản gia xử lý đơn cơ bản, làm trang danh sách các khoản (Nợ phải hoàn trả khách) nếu phát sinh nhiều ca dời ngày lẻ. Cân nhắc tích hợp Supabase Storage upload hình ảnh bill.

---

## 🌟 Lịch sử: Hệ Thống Dời Lịch Trình & Thanh Toán Thủ Công (v0.3.3)

**Tính năng đã hoàn thành:**
- **Thanh toán thủ công (Manual Checkout):**
  - Khách hàng thanh toán qua mã QR tĩnh và nhấn "Tôi đã thanh toán". Hệ thống ghi nhận trạng thái đơn là `pending` (Chờ thanh toán/Chờ xác nhận).
  - Giao diện báo rõ ràng: "Đơn đặt phòng đang chờ xác nhận từ Admin".
- **Tính năng Dời Lịch Trình (Reschedule) phía Khách hàng:**
  - Nút "Thay đổi lịch trình" trên trang Chuyến đi (`/trips`) chỉ xuất hiện với đơn `confirmed` và cách ngày đi > 10 ngày.
  - Bấm vào mở Modal popup thân thiện cho phép chọn Ngày Check-in và Check-out mới, kèm cảnh báo/gợi ý liên hệ Zalo quản gia.
  - **Giới hạn dời lịch:** Khách chỉ được hỗ trợ dời thay đổi tối đa **1 lần duy nhất** cho mỗi đơn. Sau khi đã dùng, nút sẽ bị khoá và hiển thị "Đã dùng hết quyền dời lịch".
- **Quy trình Duyệt đơn (Phía Admin Dashboard):**
  - Tại bảng danh sách đơn đặt phòng (`/admin/bookings`), Admin có Nút xác nhận "Đã nhận cọc" để cập nhật ngay đơn `pending` thành `confirmed`.
  - Các yêu cầu xin dời lịch từ khách biểu diễn ngay bằng badge màu cam nhấp nháy ⏳.
  - Popup Chi tiết đơn của Admin có giao diện so sánh hộp ngày cũ - ngày mới để quyết định **Chấp nhận Đổi** hoặc **Từ chối**. Khi Chấp nhận, biến đếm số lần đổi lịch của khách sẽ tự động tăng.

**Files đã tạo mới / chỉnh sửa:**
- `database/08_update_bookings_reschedule.sql` (Tạo cột quản lý dời lịch)
- `database/09_add_reschedule_count.sql` (Tạo biến đếm giới hạn số lần dời)
- `src/app/trips/page.tsx` (Thêm Modal Reschedule và hiển thị UI dời lịch)
- `src/app/admin/bookings/page.tsx` (Luồng quản trị duyệt dời lịch & Xác nhận chuyển khoản)
- `src/app/checkout/page.tsx` (Luồng thông báo thanh toán thành công thủ công)

---

## 🌟 Lịch sử: Cập nhật Trải nghiệm Người dùng - Đơn Booking & Nav Menu (v0.3.2)

**Tính năng đã hoàn thành:**
- **Trang Tin nhắn (Hỗ trợ khách hàng - `/messages`):**
  - Chuyển đổi từ giao diện chat nội bộ sang "Trung tâm hỗ trợ" chuyên nghiệp.
  - Gắn link **Zalo (`0333160365`)** và **Facebook cá nhân (`https://www.facebook.com/MINHPHATVILLA`)**.
  - Xóa bỏ nút gọi điện (Phone) theo yêu cầu.
  - Tối ưu UI Logo MP.
- **Trang Hồ sơ cá nhân (`/profile`):**
  - Fix lỗi hiển thị Avatar khi không có link, tự động hiển thị **2 chữ cái đầu của tên**.
  - Xây dựng hệ thống UI Popup (Modal) cho **Thanh toán & Ưu đãi**, **Thông báo** và **Đổi mật khẩu**.

---

## 📋 Tổng Quan Dự Án

**Minh Phát Villa** là website đặt phòng Villa & Homestay tại Vũng Tàu, phục vụ:

- **Khách hàng** (người dùng cuối): Đăng ký/đăng nhập tài khoản, tìm kiếm, xem chi tiết, chọn ngày và đặt phòng Villa/Homestay trực tuyến.
- **Chủ nhà / Quản trị viên**: Quản lý danh sách nơi ở, theo dõi đơn đặt phòng, quản lý người dùng thông qua trang Admin Dashboard.

### Tính năng chính:
- 🔐 **Đăng ký / Đăng nhập** bằng email với xác thực OTP qua Supabase Auth
- 🏠 Hiển thị danh sách Villa & Homestay với bộ lọc tìm kiếm (địa điểm, ngày, số khách)
- 📄 Trang chi tiết nơi ở với gallery ảnh, video, lịch đặt phòng, bản đồ
- 💳 Quy trình thanh toán (checkout) với mã QR chuyển khoản ngân hàng (VietQR)
- 📊 Trang Admin Dashboard với: thống kê tổng quan, quản lý nơi ở (CRUD), quản lý đơn đặt phòng, quản lý người dùng
- 🎨 Sanity CMS Studio tích hợp sẵn tại route `/studio`
- 📱 Nút liên hệ nhanh qua Zalo, Điện thoại, Facebook (floating buttons)
- 👤 Header với nút Đăng nhập/Đăng ký — hiện avatar + tên khi đã đăng nhập

---

## 🛠️ Tech Stack

### Ngôn ngữ & Framework

| Thành phần | Công nghệ | Phiên bản |
|---|---|---|
| **Ngôn ngữ** | TypeScript | ^5 |
| **Framework** | Next.js (App Router) | 14.1.0 |
| **UI Library** | React | ^18 |
| **Styling** | Tailwind CSS | ^3.3.0 |
| **Font** | Outfit (Google Fonts) | — |
| **Icons** | Lucide React | ^0.300.0 |

### Backend & Database

| Thành phần | Công nghệ | Mô tả |
|---|---|---|
| **CMS** | Sanity CMS | ^3.0.0 — Quản lý nội dung (property, booking, availability, dailyPricing) |
| **Database** | Supabase (PostgreSQL) | Lưu trữ dữ liệu properties, users, bookings, reviews |
| **Authentication** | Supabase Auth | Xác thực email + OTP, quản lý session |
| **SMTP** | Gmail SMTP | Gửi email OTP qua `smtp.gmail.com:587` |
| **Sanity Client** | next-sanity | ^7.0.0 — SDK kết nối Sanity từ Next.js |
| **Supabase Client** | @supabase/supabase-js | ^2.97.0 — SDK kết nối Supabase |

### Thư viện hỗ trợ

| Thư viện | Mô tả |
|---|---|
| `date-fns` | Xử lý ngày tháng (^4.1.0) |
| `react-day-picker` | Component chọn ngày (^9.13.0) |
| `class-variance-authority` | Quản lý variant cho component (^0.7.0) |
| `clsx` | Gộp className có điều kiện (^2.0.0) |
| `tailwind-merge` | Merge Tailwind class thông minh (^2.0.0) |

### API bên thứ 3

| API | Mục đích |
|---|---|
| **Sanity CDN** (`cdn.sanity.io`) | Lưu trữ & phân phối hình ảnh |
| **Unsplash** (`images.unsplash.com`) | Hình ảnh stock (dữ liệu mẫu) |
| **VietQR** | Tạo mã QR thanh toán chuyển khoản ngân hàng |
| **Google Maps Embed** | Nhúng bản đồ vị trí nơi ở |
| **Pexels Videos** | Video mẫu cho villa |

---

## 📁 Cấu Trúc Thư Mục

```
WebVilla/
├── public/                              # File tĩnh (logo, favicon)
│   └── .gitkeep
├── database/                            # 📦 SQL Migration files
│   ├── 01_create_properties_table.sql   # Bảng properties
│   ├── 02_create_bookings_table.sql     # Bảng bookings
│   ├── 03_seed_properties.sql           # Dữ liệu mẫu properties
│   ├── 04_create_users_table.sql        # Bảng users
│   ├── 05_create_reviews_table.sql      # Bảng reviews
│   ├── 06_seed_users_bookings_reviews.sql # Dữ liệu mẫu users, bookings, reviews
│   ├── 07_admin_stats_functions.sql     # Functions thống kê cho admin
│   └── 08_auth_user_sync.sql           # 🔐 Trigger đồng bộ Supabase Auth → public.users
├── src/
│   ├── app/                             # Next.js App Router (pages)
│   │   ├── layout.tsx                   # Root layout (font Outfit, meta SEO, FloatingSocialButtons)
│   │   ├── page.tsx                     # 🏠 Trang chủ — Danh sách Villa/Homestay + SearchBar + Auth header
│   │   ├── globals.css                  # CSS toàn cục + Tailwind layers
│   │   ├── providers.tsx                # Client Providers (PropertyProvider + AuthProvider)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx                 # 🔑 Trang đăng nhập (email + password)
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx                 # 📝 Trang đăng ký (2 bước: form + OTP verification)
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx                 # 👤 Trang hồ sơ cá nhân — Xem/sửa thông tin
│   │   │
│   │   ├── trips/
│   │   │   └── page.tsx                 # 🧳 Trang chuyến đi — Danh sách booking
│   │   │
│   │   ├── messages/
│   │   │   └── page.tsx                 # 💬 Trang tin nhắn — Chat UI
│   │   │
│   │   ├── [type]/                      # Dynamic route cho loại nơi ở
│   │   │   └── [id]/
│   │   │       └── page.tsx             # 📄 Trang chi tiết — Gallery ảnh, Calendar đặt phòng
│   │   │
│   │   ├── checkout/
│   │   │   └── page.tsx                 # 💳 Trang thanh toán — QR VietQR
│   │   │
│   │   ├── admin/                       # 🔐 Admin Dashboard
│   │   │   ├── layout.tsx               # Admin layout — Sidebar, TopBar, Login Screen
│   │   │   ├── page.tsx                 # 📊 Dashboard — Thống kê, biểu đồ
│   │   │   ├── properties/
│   │   │   │   ├── page.tsx             # 🏘️ Quản lý nơi ở — CRUD
│   │   │   │   └── AddPropertyModal.tsx # ➕ Modal thêm/sửa nơi ở
│   │   │   ├── bookings/
│   │   │   │   └── page.tsx             # 📝 Quản lý đặt phòng
│   │   │   └── users/
│   │   │       └── page.tsx             # 👥 Quản lý người dùng
│   │   │
│   │   └── studio/                      # Sanity Studio (CMS)
│   │       └── [[...tool]]/
│   │           ├── page.tsx
│   │           └── Studio.tsx
│   │
│   ├── components/                      # Components tái sử dụng
│   │   ├── FloatingSocialButtons.tsx     # 📱 Nút Zalo + Phone + Facebook nổi
│   │   ├── SearchBar.tsx                # 🔍 Thanh tìm kiếm nâng cao
│   │   ├── ZaloButton.tsx               # 💬 Nút liên hệ Zalo
│   │   └── villa/
│   │       ├── HeroSection.tsx          # 🎬 Hero section
│   │       └── BookingCalendar.tsx       # 📅 Lịch đặt phòng
│   │
│   ├── lib/                             # Logic, utilities, state management
│   │   ├── api.ts                       # 📦 API functions — Kết nối Sanity CMS
│   │   ├── mock-data.ts                 # 🎭 Dữ liệu mẫu + Interface Property
│   │   ├── property-store.tsx           # 🗄️ Property Store — Context + Provider, CRUD qua Supabase
│   │   ├── supabase.ts                  # 🔌 Supabase client initialization
│   │   └── auth-context.tsx             # 🔐 Auth Context — signUp, signIn, signOut, verifyOtp, resendOtp
│   │
│   └── sanity/                          # Cấu hình Sanity CMS
│       ├── env.ts
│       ├── schema.ts
│       ├── lib/
│       │   └── client.ts
│       └── schemas/
│           ├── property.ts
│           ├── booking.ts
│           ├── availability.ts
│           └── dailyPricing.ts
│
├── sanity.config.ts
├── sanity.cli.ts
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
├── tsconfig.json
├── package.json
├── .env.local                           # ⚠️ Biến môi trường (KHÔNG commit)
├── .gitignore
├── FRONTEND_ARCHITECTURE.md
├── ADMIN_SETUP_GUIDE.md
└── LICENSE
```

---

## 🔐 Hệ Thống Xác Thực (Authentication)

### Kiến trúc

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Register Page      │────▸│  Supabase Auth   │────▸│  Gmail SMTP │
│  (email + password) │     │  (auth.users)    │     │  (OTP email)│
└─────────────────────┘     └────────┬─────────┘     └─────────────┘
                                     │ trigger
                                     ▼
                            ┌──────────────────┐
                            │  public.users    │
                            │  (sync via       │
                            │   trigger)       │
                            └──────────────────┘
```

### Luồng đăng ký

```
1. User nhập: Họ tên, SĐT, Email, Mật khẩu (có kiểm tra độ mạnh)
   ↓
2. Code gọi supabase.auth.signUp() → Supabase tạo user trong auth.users
   ↓
3. Trigger 'on_auth_user_created' → tự động insert vào public.users
   ↓
4. Supabase gửi email OTP qua Gmail SMTP
   ↓
5. User nhập mã OTP → verifyOtp() → Tài khoản được xác thực
   ↓
6. Redirect về trang chủ, header hiện tên + avatar
```

### Cấu hình SMTP (Gmail)

| Mục | Giá trị |
|---|---|
| **Sender email** | `your-email@gmail.com` |
| **Sender name** | `Minh Phát Villa` |
| **Host** | `smtp.gmail.com` |
| **Port** | `587` |
| **Username** | `your-email@gmail.com` |
| **Password** | Gmail App Password (16 ký tự) |

> ⚠️ Phải bật **Xác minh 2 bước** trên Google Account → tạo **App Password** trước khi dùng SMTP.

### Email Template (Confirm Signup)

Template đã được cấu hình trên Supabase Dashboard → Authentication → Email → Templates:

```html
<h2>Xác thực tài khoản Minh Phát Villa</h2>
<p>Xin chào,</p>
<p>Mã xác thực OTP của bạn là:</p>
<h1 style="text-align: center; font-size: 32px; letter-spacing: 8px; color: #0891b2;
    background: #f0fdfa; padding: 20px; border-radius: 12px;">{{ .Token }}</h1>
<p>Mã này có hiệu lực trong <strong>60 giây</strong>.</p>
<p>— Minh Phát Villa & Homestay</p>
```

### Database Trigger (08_auth_user_sync.sql)

- Khi user đăng ký → trigger `on_auth_user_created` tự động:
  - Insert user mới vào `public.users` (name, email, phone, role='customer')
  - Nếu email đã tồn tại → `ON CONFLICT (email) DO UPDATE` (cập nhật auth_id thay vì lỗi)
- Cột `auth_id` (UUID) liên kết `public.users` với `auth.users`
- RLS policies: Users chỉ đọc/sửa profile của chính mình

---

## 🔄 Luồng Hoạt Động Chính

### Luồng 1: Khách hàng đăng ký & đặt phòng

```
1. Khách truy cập trang chủ (/) → Click "Đăng ký" trên header
   ↓
2. Nhập thông tin: Họ tên, SĐT, Email, Mật khẩu (kiểm tra độ mạnh)
   ↓
3. Nhận email OTP → Nhập mã xác thực
   ↓
4. Tài khoản được tạo → Redirect về trang chủ (header hiện tên)
   ↓
5. Xem danh sách Villa & Homestay, dùng SearchBar lọc
   ↓
6. Click vào card → Trang chi tiết (/[type]/[id])
   ↓
7. Chọn ngày check-in/out, số khách → Nhấn "Đặt ngay"
   ↓
8. Trang Checkout → Quét QR VietQR → Xác nhận chuyển khoản
```

### Luồng 2: Admin quản lý hệ thống

```
1. Truy cập /admin → Đăng nhập bằng mật khẩu quản trị
   ↓
2. Dashboard: tổng doanh thu, số nơi ở, đơn đặt phòng, người dùng
   ↓
3. Quản lý nơi ở (/admin/properties): CRUD qua Supabase
   ↓
4. Quản lý đơn đặt phòng (/admin/bookings): lọc, tìm kiếm
   ↓
5. Quản lý người dùng (/admin/users): vai trò, trạng thái
```

---

## 📐 Quy Tắc Bắt Buộc Khi Code

### 1. Ngôn ngữ comment
- **BẮT BUỘC viết comment bằng Tiếng Việt** cho tất cả các file
- Sử dụng emoji để phân loại comment section (📦, 🎨, 🔐, ...)

### 2. Styling
- **Tailwind CSS** là phương pháp styling chính
- Custom utilities: `.text-gradient`, `.glass`, `.card`, `.btn-primary`, `.btn-secondary`
- Design tokens: `primary`, `gold`, `brand` (cyan palette), Font `Outfit`

### 3. Quy tắc đặt tên
- Components: `PascalCase.tsx` — Lib: `kebab-case.ts` hoặc `camelCase.ts`
- Pages: `page.tsx` / `layout.tsx` theo Next.js convention

### 4. Import path alias
- Luôn dùng `@/*` thay vì relative path

### 5. Responsive Design
- Mobile-first, Breakpoints: `sm`, `md`, `lg`, `xl`

---

## 🔑 Biến Môi Trường (.env.local)

```env
# ─── Sanity CMS ───
NEXT_PUBLIC_SANITY_PROJECT_ID=       # ID dự án Sanity
NEXT_PUBLIC_SANITY_DATASET=          # Dataset name ("production")
NEXT_PUBLIC_SANITY_API_VERSION=      # API version (YYYY-MM-DD)
SANITY_API_TOKEN=                    # ⚠️ Token Sanity (server-side only)

# ─── Supabase Database & Auth ───
NEXT_PUBLIC_SUPABASE_URL=            # URL dự án Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # Anon key (RLS protected)
```

> ⚠️ **Lưu ý bảo mật:**
> - KHÔNG commit `.env.local` lên Git
> - Admin password cấu hình qua biến môi trường (hoặc xem trong source code `/admin/layout.tsx`)

---

## ✅ Checklist Tiến Độ

### Trang Khách Hàng (Frontend)
- [x] Trang chủ với danh sách Villa & Homestay
- [x] Card hiển thị thông tin (ảnh, giá, tiện ích, rating)
- [x] SearchBar với bộ lọc (địa điểm, ngày, số khách)
- [x] Tabs lọc theo loại (Tất cả / Villa / Homestay)
- [x] Layout responsive (mobile, tablet, desktop)
- [x] Trang chi tiết nơi ở (`/[type]/[id]`)
- [x] Gallery ảnh với slider (prev/next)
- [x] BookingCalendar (chọn ngày check-in/out)
- [x] Tính giá tự động (weekday vs weekend)
- [x] Trang Checkout (`/checkout`) với QR VietQR
- [x] Countdown timer trên trang checkout
- [x] Nút copy thông tin chuyển khoản
- [x] Hero Section với image slider + video dọc
- [x] Floating Social Buttons (Zalo, Phone, Facebook)
- [x] **🆕 Nút Đăng nhập / Đăng ký trên header trang chủ**
- [x] **🆕 Hiện avatar + tên user khi đã đăng nhập (dropdown menu)**
- [x] **🆕 Dropdown menu đầy đủ** (Yêu thích, Chuyến đi, Tin nhắn, Hồ sơ, Cài đặt, Host, Đăng xuất)
- [x] **🆕 Trang Hồ sơ cá nhân** (`/profile`) — Xem/sửa tên, SĐT, avatar hero card
- [x] **🆕 Trang Chuyến đi** (`/trips`) — Danh sách booking, filter, search
- [x] **🆕 Trang Tin nhắn** (`/messages`) — Chat UI kiểu Messenger
- [ ] Đánh giá / Review từ khách hàng
- [ ] Bản đồ Google Maps tương tác trên trang chi tiết
- [ ] Responsive mobile menu (hamburger)
- [ ] Trang danh sách theo khu vực
- [ ] Wishlist / Yêu thích

### Xác Thực (Authentication) — 🆕 MỚI
- [x] **Trang đăng ký (`/register`)** — 2 bước: form + OTP
- [x] **Trang đăng nhập (`/login`)** — email + password
- [x] **Auth Context Provider** — quản lý session, signUp, signIn, signOut, verifyOtp, updateProfile
- [x] **Supabase Auth** cấu hình email provider
- [x] **Gmail SMTP** cấu hình gửi email OTP
- [x] **Email Template** hiển thị mã OTP ({{ .Token }})
- [x] **Trigger đồng bộ** auth.users → public.users (ON CONFLICT handled)
- [x] **OTP input** — 1 ô nhập đẹp, chấp nhận mọi độ dài mã
- [x] **Password strength meter** — kiểm tra 5 tiêu chí (8 ký tự, hoa, thường, số, đặc biệt)
- [x] **Header auth buttons** — Đăng nhập/Đăng ký khi chưa login, avatar+tên khi đã login
- [x] **🆕 Trang Hồ sơ cá nhân** (`/profile`) — Xem/sửa thông tin, đổi avatar
- [ ] Bảo vệ trang Checkout (yêu cầu đăng nhập)
- [ ] Trang Quên mật khẩu (`/forgot-password`)

### Trang Admin Dashboard
- [x] Màn hình đăng nhập Admin (bằng mật khẩu quản trị)
- [x] Dashboard tổng quan (thống kê, biểu đồ)
- [x] Sidebar navigation (collapsible)
- [x] Quản lý nơi ở — danh sách với grid/list view
- [x] Modal thêm mới nơi ở (AddPropertyModal)
- [x] CRUD properties qua Supabase
- [x] Quản lý đơn đặt phòng (danh sách, lọc, tìm kiếm)
- [x] Quản lý người dùng (danh sách, vai trò)
- [ ] Xác thực Admin qua Supabase Auth (thay mật khẩu cứng)
- [ ] Biểu đồ doanh thu tương tác
- [ ] Thông báo real-time khi có đơn mới
- [ ] Export báo cáo (Excel/PDF)

### Backend & Database
- [x] Sanity Schema: Property, Booking, Availability, DailyPricing
- [x] Sanity Studio tích hợp tại `/studio`
- [x] API functions kết nối Sanity (GROQ queries)
- [x] Supabase client setup
- [x] PropertyStore (Context + Provider) kết nối Supabase
- [x] CRUD operations qua Supabase
- [x] **🆕 Database migration files (01-09)**
- [x] **🆕 Cập nhật luồng Dời Lịch Trình Khách Hàng - Quản trị**
- [x] **🆕 Trigger đồng bộ Auth → Users**
- [x] **🆕 RLS policies cho bảng users**
- [ ] API route cho booking (server-side)
- [ ] Webhook xử lý thanh toán
- [ ] Email xác nhận đặt phòng
- [ ] Đồng bộ Sanity ↔ Supabase

### AI & Bảo Mật
- [ ] Chatbot tư vấn khách hàng
- [ ] Rate limiting API
- [ ] Input validation toàn diện
- [ ] CORS configuration
- [ ] Xác thực Admin qua Supabase Auth
- [x] **🆕 Row Level Security (RLS) trên bảng users**

---

## 📝 Lịch Sử Thay Đổi Quan Trọng

| Ngày | Nội dung thay đổi |
|---|---|
| **27/02/2026** | 🆕 **[Session 4]** Hoàn thiện tính năng Dời lịch trình 1 lần & Xác nhận Thanh toán thủ công qua Admin |
| **26/02/2026 (tối)** | 🆕 **[Session 3]** Xây dựng tính năng hồ sơ khách hàng — Xem chi tiết bên dưới |
| **26/02/2026 (chiều)** | 🆕 **[Session 2]** Xây dựng hệ thống xác thực hoàn chỉnh — Xem chi tiết bên dưới |
| **26/02/2026 (sáng)** | Kết nối đầy đủ 7 trang (Admin Dashboard, Properties CRUD, Bookings, Users, Trang chủ, Chi tiết, Checkout) với Supabase. Tạo 8 file SQL migration + các hàm thống kê admin |
| **25/02/2026** | Tích hợp Supabase PostgreSQL, refactor PropertyStore từ in-memory sang Supabase |
| **29/01/2026** | Tạo FRONTEND_ARCHITECTURE.md |
| **27/01/2026** | Khởi tạo dự án, xây dựng trang chủ, chi tiết, checkout, admin dashboard |

### 🧳 Chi Tiết Session 3 (26/02/2026 tối)

**Tính năng đã hoàn thành:**
1. ✅ Dropdown menu đầy đủ kiểu Airbnb — 4 nhóm: Chức năng / Cài đặt / Host / Đăng xuất
2. ✅ Trang Hồ sơ cá nhân (`/profile`) — Hero card, chỉnh sửa tên/SĐT, thống kê, menu tài khoản
3. ✅ Trang Chuyến đi (`/trips`) — Danh sách booking từ Supabase, filter tabs, search, empty state
4. ✅ Trang Tin nhắn (`/messages`) — Chat UI kiểu Messenger, sidebar + chat area, responsive
5. ✅ Hàm `updateProfile` trong Auth Context — Cập nhật thông tin user qua Supabase

**Files đã tạo mới:**
- `src/app/profile/page.tsx` — Trang hồ sơ cá nhân
- `src/app/trips/page.tsx` — Trang chuyến đi
- `src/app/messages/page.tsx` — Trang tin nhắn

**Files đã chỉnh sửa:**
- `src/app/page.tsx` — Thay dropdown menu đơn giản → menu đầy đủ với overlay
- `src/lib/auth-context.tsx` — Thêm hàm `updateProfile()` và export qua Provider

### 🔐 Chi Tiết Session 2 (26/02/2026 chiều)

**Tính năng đã hoàn thành:**
1. ✅ Trang đăng ký (`/register`) — 2 bước với OTP verification
2. ✅ Trang đăng nhập (`/login`) — email + password
3. ✅ Auth Context Provider (`auth-context.tsx`) — quản lý toàn bộ xác thực
4. ✅ Gmail SMTP cấu hình trên Supabase — gửi email OTP thật
5. ✅ Email template với mã OTP (`{{ .Token }}`)
6. ✅ Trigger database đồng bộ auth.users → public.users
7. ✅ Header trang chủ có nút Đăng nhập/Đăng ký + dropdown user menu
8. ✅ Password strength meter (5 tiêu chí)

**Files đã tạo mới:**
- `src/app/register/page.tsx` — Trang đăng ký (form + OTP)
- `src/app/login/page.tsx` — Trang đăng nhập
- `src/lib/auth-context.tsx` — Auth Context Provider
- `database/08_auth_user_sync.sql` — SQL trigger đồng bộ auth

**Files đã chỉnh sửa:**
- `src/app/providers.tsx` — Thêm AuthProvider
- `src/app/page.tsx` — Thêm nút Đăng nhập/Đăng ký vào header, import useAuth

**Bugs đã fix:**
- 🐛 Bug OTP input lặp số (nhập 1 số → tất cả ô hiện cùng số) → Viết lại OTP component
- 🐛 "Database error saving new user" khi đăng ký lại cùng email → Thêm ON CONFLICT DO UPDATE
- 🐛 Email gửi link thay vì mã 6 số → Sửa email template thêm `{{ .Token }}`
- 🐛 Lint error `Cannot find name 'OTP_LENGTH'` → Xóa references thừa

**Cấu hình Supabase đã thực hiện:**
- ✅ Enable custom SMTP (Gmail)
- ✅ Cập nhật Email Template (Confirm Signup) hiển thị OTP
- ✅ Bật Confirm Email trong Providers

---

## 🚀 Hướng Dẫn Chạy Dự Án

### Yêu cầu
- Node.js >= 18
- npm hoặc yarn

### Cài đặt & Khởi chạy

```bash
# 1. Clone repo và vào thư mục dự án
cd WebVilla

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env.local với các biến môi trường (xem mục Biến Môi Trường)

# 4. Chạy SQL migrations trên Supabase SQL Editor (files 01-08 trong thư mục database/)

# 5. Chạy development server
npm run dev

# 6. Mở trình duyệt tại http://localhost:3000
```

### Scripts có sẵn

| Script | Lệnh | Mô tả |
|---|---|---|
| Dev Server | `npm run dev` | Chạy Next.js development server |
| Build | `npm run build` | Build production bundle |
| Start | `npm run start` | Chạy production server |
| Lint | `npm run lint` | Kiểm tra lỗi ESLint |
| Sanity Studio | `npm run studio` | Chạy Sanity Studio standalone |

### URLs quan trọng

| URL | Mô tả |
|---|---|
| `http://localhost:3000` | Trang chủ (khách hàng) |
| `http://localhost:3000/login` | 🆕 Trang đăng nhập |
| `http://localhost:3000/register` | 🆕 Trang đăng ký |
| `http://localhost:3000/profile` | 🆕 Trang hồ sơ cá nhân |
| `http://localhost:3000/trips` | 🆕 Trang chuyến đi |
| `http://localhost:3000/messages` | 🆕 Trang tin nhắn |
| `http://localhost:3000/admin` | Admin Dashboard |
| `http://localhost:3000/studio` | Sanity CMS Studio |
| `http://localhost:3000/villa/[id]` | Trang chi tiết property |
| `http://localhost:3000/checkout` | Trang thanh toán |

---

## 📌 Ghi Chú Quan Trọng Cho Cuộc Trò Chuyện Tiếp Theo

### ⚠️ Việc Cần Làm Tiếp (Next Session)

1. **Bảo vệ trang Checkout** — Redirect user chưa đăng nhập về `/login`
2. **Trang Quên mật khẩu** (`/forgot-password`) — Gửi email reset password
3. **Trang Hồ sơ cá nhân** (`/profile`) — Xem/sửa thông tin user
4. **OTP length** — Supabase gửi 8 số, Dashboard không cho đổi thành 6 trên Free Plan. Hiện tại code chấp nhận mọi độ dài (≥ 6 số). Nếu muốn chính xác 6 số, cần upgrade Supabase hoặc dùng API `PATCH /v1/projects/{id}/config/auth` với `mailer_otp_length: 6`.
5. **Mobile responsive** — Header cần hamburger menu cho mobile (nút Đăng nhập/Đăng ký bị ẩn trên mobile)

### 🔧 Lưu ý kỹ thuật

1. **Dual Data Source**: Supabase (chính) + Sanity CMS (nội dung rich) — chưa đồng bộ hoàn toàn
2. **Mock Data vẫn tồn tại**: `mock-data.ts` chứa interface `Property` và dữ liệu mẫu
3. **Admin Auth giả lập**: Dùng mật khẩu cố định cấu hình trong `layout.tsx`
4. **Thanh toán chưa tự động**: Chỉ tạo QR, chưa có webhook xác nhận
5. **Supabase Project ID**: `your-supabase-project-id`
6. **Gmail account**: `your-email@gmail.com` (dùng cho SMTP)
7. **Auth Context** wraps toàn app → mọi component đều access được user/profile qua `useAuth()`
