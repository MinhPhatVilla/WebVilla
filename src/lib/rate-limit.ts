/**
 * 🛡️ P1 SECURITY: Rate Limiting Utility
 * 
 * In-memory rate limiter cho API routes.
 * Giới hạn số request/IP trong 1 khoảng thời gian.
 * 
 * Production: Nên dùng Redis-based rate limiter (Upstash) thay vì in-memory.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Tự dọn dẹp entries hết hạn mỗi 5 phút
setInterval(() => {
    const now = Date.now();
    Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    });
}, 5 * 60 * 1000);

interface RateLimitConfig {
    /** Số request tối đa trong window */
    maxRequests: number;
    /** Thời gian window (milliseconds) */
    windowMs: number;
}

/**
 * Kiểm tra rate limit cho 1 identifier (thường là IP)
 * @returns { allowed: boolean, remaining: number, retryAfterMs: number }
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    const key = identifier;
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        // Window mới
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return { allowed: true, remaining: config.maxRequests - 1, retryAfterMs: 0 };
    }

    if (entry.count >= config.maxRequests) {
        // Vượt quá giới hạn
        return {
            allowed: false,
            remaining: 0,
            retryAfterMs: entry.resetTime - now,
        };
    }

    // Vẫn trong giới hạn
    entry.count++;
    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        retryAfterMs: 0,
    };
}

// ── Preset configs cho các loại route khác nhau ──

/** API chung: 60 request / phút */
export const RATE_LIMIT_API = { maxRequests: 60, windowMs: 60 * 1000 };

/** Login/Register: 5 lần / 15 phút (chống brute-force) */
export const RATE_LIMIT_AUTH = { maxRequests: 5, windowMs: 15 * 60 * 1000 };

/** Booking creation: 10 lần / 15 phút */
export const RATE_LIMIT_BOOKING = { maxRequests: 10, windowMs: 15 * 60 * 1000 };

/** Telegram notifications: 20 lần / phút */
export const RATE_LIMIT_TELEGRAM = { maxRequests: 20, windowMs: 60 * 1000 };

/** Admin operations: 100 lần / phút */
export const RATE_LIMIT_ADMIN = { maxRequests: 100, windowMs: 60 * 1000 };
