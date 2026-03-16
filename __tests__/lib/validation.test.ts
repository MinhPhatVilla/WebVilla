/**
 * 🧪 Unit Tests — validation.ts
 * Testing: sanitizeString, isValidEmail, isValidPhone, isValidDate,
 * isValidGuestCount, isValidPrice, isValidName, validateBooking
 */

import {
    sanitizeString,
    sanitizeVietnamese,
    isValidEmail,
    isValidPhone,
    isValidDate,
    isValidGuestCount,
    isValidPrice,
    isValidName,
    validateBooking,
} from "@/lib/validation";

// ── sanitizeString ──
describe("sanitizeString", () => {
    it("should escape HTML special characters", () => {
        expect(sanitizeString("<script>alert('xss')</script>")).not.toContain("<script>");
        expect(sanitizeString("<script>alert('xss')</script>")).toContain("&lt;script&gt;");
    });

    it("should handle empty string", () => {
        expect(sanitizeString("")).toBe("");
    });

    it("should trim whitespace", () => {
        expect(sanitizeString("  hello  ")).toBe("hello");
    });

    it("should escape quotes", () => {
        const result = sanitizeString('He said "hello"');
        expect(result).toContain("&quot;");
    });
});

// ── sanitizeVietnamese ──
describe("sanitizeVietnamese", () => {
    it("should keep Vietnamese characters", () => {
        expect(sanitizeVietnamese("Nguyễn Văn A")).toBe("Nguyễn Văn A");
    });

    it("should remove script tags", () => {
        const input = 'Xin chào <script>alert("xss")</script> bạn';
        expect(sanitizeVietnamese(input)).not.toContain("<script>");
    });

    it("should remove iframe tags", () => {
        const input = 'test <iframe src="evil.com"></iframe> test';
        expect(sanitizeVietnamese(input)).not.toContain("<iframe");
    });

    it("should handle empty string", () => {
        expect(sanitizeVietnamese("")).toBe("");
    });
});

// ── isValidEmail ──
describe("isValidEmail", () => {
    it("should accept valid email", () => {
        expect(isValidEmail("test@example.com")).toBe(true);
    });

    it("should reject email without @", () => {
        expect(isValidEmail("testexample.com")).toBe(false);
    });

    it("should reject email without domain", () => {
        expect(isValidEmail("test@")).toBe(false);
    });

    it("should reject too long email", () => {
        const longEmail = "a".repeat(252) + "@b.c";
        expect(isValidEmail(longEmail)).toBe(false);
    });
});

// ── isValidPhone ──
describe("isValidPhone", () => {
    it("should accept valid VN phone (0xxx)", () => {
        expect(isValidPhone("0912345678")).toBe(true);
    });

    it("should accept valid VN phone (+84xxx)", () => {
        expect(isValidPhone("+84912345678")).toBe(true);
    });

    it("should accept phone with dashes", () => {
        expect(isValidPhone("091-234-5678")).toBe(true);
    });

    it("should reject too short phone", () => {
        expect(isValidPhone("091234")).toBe(false);
    });

    it("should reject non-VN phone", () => {
        expect(isValidPhone("1234567890")).toBe(false);
    });
});

// ── isValidDate ──
describe("isValidDate", () => {
    it("should accept valid date in range", () => {
        expect(isValidDate("2025-06-15")).toBe(true);
    });

    it("should reject invalid date string", () => {
        expect(isValidDate("not-a-date")).toBe(false);
    });

    it("should reject date before 2024", () => {
        expect(isValidDate("2023-01-01")).toBe(false);
    });

    it("should reject date after 2030", () => {
        expect(isValidDate("2031-01-01")).toBe(false);
    });
});

// ── isValidGuestCount ──
describe("isValidGuestCount", () => {
    it("should accept 1", () => {
        expect(isValidGuestCount(1)).toBe(true);
    });

    it("should accept 100", () => {
        expect(isValidGuestCount(100)).toBe(true);
    });

    it("should reject 0", () => {
        expect(isValidGuestCount(0)).toBe(false);
    });

    it("should reject 101", () => {
        expect(isValidGuestCount(101)).toBe(false);
    });

    it("should reject float", () => {
        expect(isValidGuestCount(1.5)).toBe(false);
    });
});

// ── isValidPrice ──
describe("isValidPrice", () => {
    it("should accept 0", () => {
        expect(isValidPrice(0)).toBe(true);
    });

    it("should accept normal price", () => {
        expect(isValidPrice(5000000)).toBe(true);
    });

    it("should reject negative", () => {
        expect(isValidPrice(-1)).toBe(false);
    });

    it("should reject over 1 billion", () => {
        expect(isValidPrice(1_000_000_001)).toBe(false);
    });
});

// ── isValidName ──
describe("isValidName", () => {
    it("should accept normal name", () => {
        expect(isValidName("Nguyễn Văn A")).toBe(true);
    });

    it("should reject empty string", () => {
        expect(isValidName("")).toBe(false);
    });

    it("should reject only whitespace", () => {
        expect(isValidName("   ")).toBe(false);
    });

    it("should reject too long name", () => {
        expect(isValidName("a".repeat(201))).toBe(false);
    });
});

// ── validateBooking ──
describe("validateBooking", () => {
    const validBooking = {
        property_id: "villa-01",
        property_name: "Villa Minh Phát 01",
        guest_name: "Nguyễn Văn A",
        guest_phone: "0912345678",
        guest_email: "test@email.com",
        guest_count: 5,
        check_in: "2025-07-01",
        check_out: "2025-07-03",
        total_price: 5000000,
    };

    it("should validate correct booking", () => {
        const result = validateBooking(validBooking);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitized).toBeDefined();
    });

    it("should reject null input", () => {
        const result = validateBooking(null);
        expect(result.valid).toBe(false);
    });

    it("should reject missing property_id", () => {
        const result = validateBooking({ ...validBooking, property_id: "" });
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("property_id không hợp lệ");
    });

    it("should reject invalid phone", () => {
        const result = validateBooking({ ...validBooking, guest_phone: "123" });
        expect(result.valid).toBe(false);
    });

    it("should reject check_out before check_in", () => {
        const result = validateBooking({
            ...validBooking,
            check_in: "2025-07-05",
            check_out: "2025-07-03",
        });
        expect(result.valid).toBe(false);
    });

    it("should sanitize guest name", () => {
        const result = validateBooking({
            ...validBooking,
            guest_name: '  Nguyễn Văn <script>xss</script> A  ',
        });
        expect(result.valid).toBe(true);
        expect(result.sanitized!.guest_name).not.toContain("<script>");
    });

    it("should lowercase email", () => {
        const result = validateBooking({
            ...validBooking,
            guest_email: "Test@Email.COM",
        });
        expect(result.sanitized!.guest_email).toBe("test@email.com");
    });
});
