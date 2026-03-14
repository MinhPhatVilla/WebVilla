/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.sanity.io',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'yxicgoshfmhjtkwcaeym.supabase.co',
            },
        ],
    },

    // ============================================
    // 🛡️ P1 SECURITY: HTTP Security Headers
    // ============================================
    async headers() {
        return [
            {
                // Áp dụng cho TẤT CẢ routes
                source: '/(.*)',
                headers: [
                    // 🔒 Chống Clickjacking — không cho nhúng web vào iframe
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    // 🔒 Chống MIME sniffing
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    // 🔒 Bật XSS filter của trình duyệt
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    // 🔒 Chống leak thông tin URL khi chuyển trang
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    // 🔒 Giới hạn tính năng trình duyệt (camera, mic, GPS...)
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(self), payment=(self)',
                    },
                    // 🔒 Bắt buộc HTTPS (1 năm = 31536000 giây)
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                    // 🔒 Content Security Policy — chống XSS injection
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.sanity.io",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com data:",
                            "img-src 'self' https://cdn.sanity.io https://images.unsplash.com https://yxicgoshfmhjtkwcaeym.supabase.co https://*.supabase.co data: blob:",
                            "connect-src 'self' https://yxicgoshfmhjtkwcaeym.supabase.co https://*.supabase.co wss://*.supabase.co https://cdn.sanity.io https://api.telegram.org https://my.dev.sepay.vn https://qr.sepay.vn",
                            "frame-src 'self'",
                            "object-src 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                            "frame-ancestors 'none'",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
