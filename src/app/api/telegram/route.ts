/**
 * 🛡️ P1 SECURITY: Telegram Notification API (Secured)
 * 
 * Gửi thông báo Telegram — có rate limiting + input validation.
 */
import { NextResponse } from 'next/server';
import { sanitizeVietnamese } from '@/lib/validation';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Thiếu nội dung thông báo' },
                { status: 400 }
            );
        }

        // 🛡️ Giới hạn độ dài message (chống spam payload lớn)
        if (message.length > 4000) {
            return NextResponse.json(
                { success: false, error: 'Nội dung quá dài (tối đa 4000 ký tự)' },
                { status: 400 }
            );
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Lỗi: Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID');
            return NextResponse.json(
                { success: false, error: 'Lỗi cấu hình server' },
                { status: 500 }
            );
        }

        // 🛡️ Sanitize message trước khi gửi
        const sanitizedMessage = sanitizeVietnamese(message);

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: sanitizedMessage,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Telegram API Error:', data);
            return NextResponse.json(
                { success: false, error: 'Không thể gửi tin nhắn Telegram' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Lỗi API Telegram:', error);
        return NextResponse.json(
            { success: false, error: 'Lỗi hệ thống' },
            { status: 500 }
        );
    }
}
