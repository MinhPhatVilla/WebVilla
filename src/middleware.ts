/**
 * 🛡️ P1 SECURITY: Next.js Middleware
 * 
 * Tầng bảo mật đầu tiên cho TẤT CẢ requests:
 * - Rate limiting các API routes
 * - Block các path nhạy cảm
 * - Log suspicious activities
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── In-memory rate limit store (cho Edge Runtime) ──
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: NextRequest): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}

function isRateLimited(ip: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
        return false;
    }

    entry.count++;
    return entry.count > maxRequests;
}

// Cleanup cũ mỗi 60s
let lastCleanup = Date.now();
function cleanupIfNeeded() {
    const now = Date.now();
    if (now - lastCleanup > 60_000) {
        lastCleanup = now;
        Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
            if (now > entry.resetTime) {
                rateLimitMap.delete(key);
            }
        });
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = getClientIP(request);

    cleanupIfNeeded();

    // ── 1. Block sensitive paths ──
    const blockedPaths = [
        "/.env",
        "/.git",
        "/wp-admin",
        "/wp-login",
        "/xmlrpc.php",
        "/phpmyadmin",
        "/.htaccess",
        "/server-status",
        "/actuator",
    ];

    if (blockedPaths.some((p) => pathname.toLowerCase().startsWith(p))) {
        return new NextResponse("Not Found", { status: 404 });
    }

    // ── 2. Rate limit API routes ──
    if (pathname.startsWith("/api/")) {
        // Telegram: 20 requests/phút
        if (pathname.startsWith("/api/telegram")) {
            if (isRateLimited(`telegram:${ip}`, 20, 60_000)) {
                return NextResponse.json(
                    { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
                    { status: 429 }
                );
            }
        }

        // Admin API: 100 requests/phút
        if (pathname.startsWith("/api/admin")) {
            if (isRateLimited(`admin:${ip}`, 100, 60_000)) {
                return NextResponse.json(
                    { error: "Quá nhiều yêu cầu admin. Vui lòng thử lại sau." },
                    { status: 429 }
                );
            }
        }

        // Booking API: 10 requests/15 phút
        if (pathname.startsWith("/api/bookings")) {
            if (isRateLimited(`booking:${ip}`, 10, 15 * 60_000)) {
                return NextResponse.json(
                    { error: "Quá nhiều yêu cầu đặt phòng. Vui lòng thử lại sau 15 phút." },
                    { status: 429 }
                );
            }
        }

        // General API: 60 requests/phút
        if (isRateLimited(`api:${ip}`, 60, 60_000)) {
            return NextResponse.json(
                { error: "Quá nhiều yêu cầu. Vui lòng chờ 1 phút." },
                { status: 429 }
            );
        }
    }

    // ── 3. Rate limit admin page (chống brute-force login) ──
    if (pathname.startsWith("/admin")) {
        if (isRateLimited(`admin-page:${ip}`, 30, 60_000)) {
            return new NextResponse("Too many requests", { status: 429 });
        }
    }

    // ── 4. Add security headers cho response ──
    const response = NextResponse.next();

    // Ngăn caching thông tin nhạy cảm
    if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) {
        response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.headers.set("Pragma", "no-cache");
    }

    return response;
}

// ── Chỉ áp dụng middleware cho các path cần thiết ──
export const config = {
    matcher: [
        // API routes
        "/api/:path*",
        // Admin pages
        "/admin/:path*",
        // Block common attack paths
        "/.env:path*",
        "/.git:path*",
        "/wp-admin:path*",
        "/wp-login:path*",
    ],
};
