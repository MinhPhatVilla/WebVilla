import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ success: false, error: 'Thiếu nội dung thông báo' }, { status: 400 });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.error('Lỗi: Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong .env.local');
            return NextResponse.json({ success: false, error: 'Lỗi cấu hình server' }, { status: 500 });
        }

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML', // Cho phép format text bằng HTML (<b>, <i>...)
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Telegram API Error:', data);
            return NextResponse.json({ success: false, error: 'Không thể gửi tin nhắn Telegram' }, { status: response.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Lỗi API Telegram:', error);
        return NextResponse.json({ success: false, error: 'Lít lỗi hệ thống API nội bộ' }, { status: 500 });
    }
}
