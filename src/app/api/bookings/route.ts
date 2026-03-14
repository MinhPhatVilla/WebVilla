/**
 * 🛡️ P1 SECURITY: Public Booking API
 * 
 * Server-side API route cho khách hàng tạo booking.
 * - POST: Tạo booking mới (cần auth + validation + rate limit)
 * - Input validation + sanitization đầy đủ
 * - Gửi thông báo Telegram sau khi tạo thành công
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateBooking } from "@/lib/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ── POST: Tạo booking mới ──
export async function POST(request: Request) {
    try {
        // 1. Xác thực user (phải đăng nhập)
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Vui lòng đăng nhập để đặt phòng" },
                { status: 401 }
            );
        }

        const token = authHeader.replace("Bearer ", "");
        const supabase = getServiceClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json(
                { error: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại" },
                { status: 401 }
            );
        }

        // 2. Validate & sanitize input
        const body = await request.json();
        const validation = validateBooking(body);

        if (!validation.valid) {
            return NextResponse.json(
                { error: "Dữ liệu không hợp lệ", details: validation.errors },
                { status: 400 }
            );
        }

        const bookingData = validation.sanitized!;

        // 3. Kiểm tra property tồn tại
        const { data: property, error: propError } = await supabase
            .from("properties")
            .select("id, name")
            .eq("id", bookingData.property_id)
            .single();

        if (propError || !property) {
            return NextResponse.json(
                { error: "Nơi ở không tồn tại" },
                { status: 404 }
            );
        }

        // 4. Kiểm tra trùng lịch
        const { data: conflicting } = await supabase
            .from("bookings")
            .select("id")
            .eq("property_id", bookingData.property_id)
            .in("status", ["pending", "confirmed", "checked_in"])
            .lt("check_in", bookingData.check_out)
            .gt("check_out", bookingData.check_in);

        if (conflicting && conflicting.length > 0) {
            return NextResponse.json(
                { error: "Nơi ở đã được đặt trong khoảng thời gian này" },
                { status: 409 }
            );
        }

        // 5. Tạo booking
        const { data: booking, error: insertError } = await supabase
            .from("bookings")
            .insert({
                ...bookingData,
                status: "pending",
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // 6. Gửi thông báo Telegram (fire-and-forget)
        try {
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;
            if (botToken && chatId) {
                const message = [
                    "🏠 <b>ĐƠN ĐẶT PHÒNG MỚI</b>",
                    "",
                    `📋 Mã đơn: <b>${booking.id}</b>`,
                    `🏡 Nơi ở: ${booking.property_name}`,
                    `👤 Khách: ${booking.guest_name}`,
                    `📞 SĐT: ${booking.guest_phone}`,
                    `📅 ${booking.check_in} → ${booking.check_out}`,
                    `👥 ${booking.guest_count} khách`,
                    `💰 Tổng: ${Number(booking.total_price).toLocaleString("vi-VN")}đ`,
                    `💳 Cọc: ${Number(booking.deposit_amount).toLocaleString("vi-VN")}đ`,
                ].join("\n");

                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
                });
            }
        } catch {
            // Không throw lỗi nếu gửi Telegram thất bại
        }

        return NextResponse.json({ data: booking }, { status: 201 });
    } catch (err: any) {
        console.error("Booking API Error:", err);
        return NextResponse.json(
            { error: "Lỗi hệ thống, vui lòng thử lại" },
            { status: 500 }
        );
    }
}
