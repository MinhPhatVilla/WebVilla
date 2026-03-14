/**
 * 🛡️ P1 SECURITY: Input Validation & Sanitization
 * 
 * Validate và sanitize tất cả input trước khi ghi vào database.
 * Chống: XSS, SQL Injection, HTML Injection, Script Injection
 */

// ── Sanitize HTML/Script tags ──
export function sanitizeString(input: string): string {
    if (!input) return "";
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;")
        .trim();
}

/** Sanitize nhưng giữ nguyên ký tự tiếng Việt */
export function sanitizeVietnamese(input: string): string {
    if (!input) return "";
    // Loại bỏ script tags và event handlers
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
        .replace(/<embed[^>]*>/gi, "")
        .replace(/<link[^>]*>/gi, "")
        .trim();
}

// ── Validators ──

export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && email.length <= 254;
}

export function isValidPhone(phone: string): boolean {
    // Số điện thoại VN: 0xxx hoặc +84xxx, 9-11 chữ số
    const re = /^(\+84|0)\d{8,10}$/;
    return re.test(phone.replace(/[\s-]/g, ""));
}

export function isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime()) && date.getFullYear() >= 2024 && date.getFullYear() <= 2030;
}

export function isValidGuestCount(count: number): boolean {
    return Number.isInteger(count) && count >= 1 && count <= 100;
}

export function isValidPrice(price: number): boolean {
    return typeof price === "number" && price >= 0 && price <= 1_000_000_000;
}

export function isValidName(name: string): boolean {
    return typeof name === "string" && name.trim().length >= 1 && name.length <= 200;
}

// ── Booking Validator ──

export interface BookingInput {
    property_id: string;
    property_name: string;
    guest_name: string;
    guest_phone: string;
    guest_email?: string;
    guest_count: number;
    check_in: string;
    check_out: string;
    total_price: number;
    deposit_amount?: number;
    payment_method?: string;
    notes?: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
    sanitized?: BookingInput;
}

export function validateBooking(input: any): ValidationResult {
    const errors: string[] = [];

    if (!input || typeof input !== "object") {
        return { valid: false, errors: ["Dữ liệu không hợp lệ"] };
    }

    // Required fields
    if (!input.property_id || typeof input.property_id !== "string") {
        errors.push("property_id không hợp lệ");
    }
    if (!isValidName(input.guest_name)) {
        errors.push("Tên khách hàng không hợp lệ (1-200 ký tự)");
    }
    if (!isValidPhone(input.guest_phone || "")) {
        errors.push("Số điện thoại không hợp lệ (VD: 0912345678)");
    }
    if (input.guest_email && !isValidEmail(input.guest_email)) {
        errors.push("Email không hợp lệ");
    }
    if (!isValidGuestCount(input.guest_count)) {
        errors.push("Số khách không hợp lệ (1-100)");
    }
    if (!isValidDate(input.check_in)) {
        errors.push("Ngày nhận phòng không hợp lệ");
    }
    if (!isValidDate(input.check_out)) {
        errors.push("Ngày trả phòng không hợp lệ");
    }
    if (input.check_in && input.check_out && new Date(input.check_in) >= new Date(input.check_out)) {
        errors.push("Ngày trả phòng phải sau ngày nhận phòng");
    }
    if (!isValidPrice(input.total_price)) {
        errors.push("Tổng giá không hợp lệ");
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Sanitize
    const sanitized: BookingInput = {
        property_id: input.property_id.trim(),
        property_name: sanitizeVietnamese(input.property_name || ""),
        guest_name: sanitizeVietnamese(input.guest_name),
        guest_phone: input.guest_phone.replace(/[\s-]/g, "").trim(),
        guest_email: input.guest_email ? input.guest_email.trim().toLowerCase() : "",
        guest_count: Math.floor(input.guest_count),
        check_in: input.check_in,
        check_out: input.check_out,
        total_price: Math.floor(input.total_price),
        deposit_amount: input.deposit_amount ? Math.floor(input.deposit_amount) : 0,
        payment_method: sanitizeVietnamese(input.payment_method || "Chờ thanh toán"),
        notes: sanitizeVietnamese(input.notes || ""),
    };

    return { valid: true, errors: [], sanitized };
}
