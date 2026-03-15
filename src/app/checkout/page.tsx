"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
// Property data lấy từ PropertyStore (Supabase)
import { usePropertyStore } from "@/lib/property-store";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Calendar, Users, BedDouble, MapPin, Star,
    Copy, Check, CheckCircle2, Clock, AlertCircle,
    MessageCircle, Phone, Loader2, Sparkles, Shield,
    ChevronDown, ChevronUp,
} from "lucide-react";

// ── Thông tin tài khoản ngân hàng ──
const BANK_INFO = {
    bankName: "TPBank",
    bankCode: "TPB",
    accountNumber: "11223311223",
    accountName: "NGO MINH PHAT",
    bin: "970423", // BIN TPBank for VietQR
};

// ── Tạo QR URL theo chuẩn VietQR ──
function buildQRUrl(amount: number, content: string): string {
    const encoded = encodeURIComponent(content);
    return (
        `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact2.png` +
        `?amount=${amount}&addInfo=${encoded}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`
    );
}

// ── Countdown Timer ──
function CountdownTimer({ seconds, urgent }: { seconds: number; urgent: boolean }) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const pct = (seconds / (15 * 60)) * 100;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-colors ${urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            }`}>
            {/* SVG ring */}
            <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                        fill="none" stroke="#e5e7eb" strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                        fill="none"
                        stroke={urgent ? "#ef4444" : "#f59e0b"}
                        strokeWidth="3"
                        strokeDasharray={`${pct}, 100`}
                        strokeLinecap="round"
                    />
                </svg>
                <Clock size={14} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${urgent ? "text-red-500" : "text-amber-500"}`} />
            </div>
            <div>
                <p className={`font-bold text-base ${urgent ? "text-red-700" : "text-amber-700"}`}>
                    Giữ giá: {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </p>
                <p className="text-xs text-gray-500">Quét QR thanh toán trước khi hết giờ</p>
            </div>
        </div>
    );
}

// ── Nút copy ──
function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-bold transition-all active:scale-95"
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Đã copy!" : label}
        </button>
    );
}

// ── Main checkout content ──
function CheckoutContent() {
    const searchParams = useSearchParams();
    const { user, profile } = useAuth();

    const propertyId = searchParams.get("property") || "";
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const guests = parseInt(searchParams.get("guests") || "2");

    const store = usePropertyStore();
    const property = store.getPropertyById(propertyId);

    // countdown 15 phút
    const [timeLeft, setTimeLeft] = useState(15 * 60);
    const [confirmed, setConfirmed] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");

    // Prefill user data
    useEffect(() => {
        if (profile?.name && !guestName) setGuestName(profile.name);
        if (profile?.phone && !guestPhone) setGuestPhone(profile.phone);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile]);

    useEffect(() => {
        if (confirmed) return;
        const t = setInterval(() => setTimeLeft(p => (p > 0 ? p - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, [confirmed]);

    // ── Tính giá ──
    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 0;
        const d = Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
        );
        return d > 0 ? d : 0;
    }, [checkIn, checkOut]);

    const totalPrice = (property?.price.weekday || 0) * nights;
    const deposit = Math.ceil(totalPrice * 0.5);
    const remaining = totalPrice - deposit;
    const fmtPrice = (n: number) => n.toLocaleString("vi-VN");
    const fmtDate = (d: string) =>
        d ? new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

    // Mã đặt phòng
    const bookingCode = useMemo(() => `MP${Date.now().toString(36).toUpperCase().slice(-6)}`, []);
    const transferNote = `${bookingCode} DAT PHONG`;
    const qrUrl = buildQRUrl(deposit, transferNote);

    // ── Xác nhận đã chuyển khoản ──
    const handleConfirm = async () => {
        if (!guestName.trim() || !guestPhone.trim()) {
            alert("Vui lòng nhập họ tên và số điện thoại!");
            return;
        }
        setConfirming(true);
        try {
            // Ghi đơn booking vào Supabase
            const { error: insertError } = await supabase.from("bookings").insert({
                id: bookingCode,
                property_id: propertyId,
                property_name: property?.name || "",
                guest_name: guestName.trim(),
                guest_phone: guestPhone.trim(),
                guest_email: profile?.email || user?.email || "",
                check_in: checkIn,
                check_out: checkOut,
                guest_count: guests,
                total_price: totalPrice,
                deposit_amount: deposit,
                status: "pending",
                notes: `Nội dung CK: ${transferNote}`,
            });

            if (insertError) {
                throw insertError;
            }

            // --- GỬI THÔNG BÁO TELEGRAM (Background, không làm block luồng UI) ---
            try {
                const checkInDate = new Date(checkIn).toLocaleDateString('vi-VN');
                const checkOutDate = new Date(checkOut).toLocaleDateString('vi-VN');
                const msg = `🚨 <b>CÓ ĐƠN ĐẶT PHONG MỚI</b> 🚨\n\n` +
                    `👤 Khách: <b>${guestName.trim()}</b> (${guestPhone.trim()})\n` +
                    `🏡 Căn: <b>${property?.name}</b>\n` +
                    `📅 Check-in: ${checkInDate}\n` +
                    `📅 Check-out: ${checkOutDate}\n` +
                    `👥 Số lượng: ${guests} khách\n` +
                    `💰 Tổng tiền: ${fmtPrice(totalPrice)}đ\n` +
                    `✅ Đã cọc: ${fmtPrice(deposit)}đ\n` +
                    `🔖 Mã đơn: #${bookingCode}`;

                // Fire and forget
                fetch('/api/telegram', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg })
                }).catch(err => console.error("Send Notif Error:", err));
            } catch (teleErr) {
                console.error("Gửi thông báo Telegram lỗi cục bộ:", teleErr);
            }

            // Chỉ xác nhận thành công nếu KHÔNG có lỗi database
            setConfirming(false);
            setConfirmed(true);
        } catch (err) {
            console.error("Lỗi lưu booking:", err);
            setConfirming(false);
            alert("Có lỗi xảy ra khi tạo đơn đặt phòng. Vui lòng thử lại!");
        }
    };

    // ──── Màn hình không tìm thấy ────
    if (!property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <span className="text-6xl">🏠</span>
                <p className="text-xl font-bold text-gray-700">Không tìm thấy phòng</p>
                <Link href="/" className="text-cyan-600 font-semibold hover:underline">← Về trang chủ</Link>
            </div>
        );
    }

    // ──── Màn hình PROCESSING ────
    if (confirming) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-cyan-50 to-blue-50">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">💳</span>
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-gray-900">Đang xác nhận thanh toán…</h2>
                    <p className="text-gray-500 mt-1">Vui lòng không tắt trang</p>
                </div>
                <div className="flex gap-1.5">
                    {[0, 150, 300].map(d => (
                        <div key={d} className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                </div>
            </div>
        );
    }

    // ──── Màn hình THÀNH CÔNG ────
    if (confirmed) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-green-50 via-cyan-50 to-blue-50">
                {/* Header */}
                <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 h-14 flex items-center px-4">
                    <div className="max-w-lg mx-auto w-full flex items-center gap-3">
                        <Image src="/logo.png" alt="Minh Phát Villa" width={36} height={36} className="rounded-full" />
                        <span className="font-bold text-gray-900">Minh Phát Villa</span>
                    </div>
                </header>

                <div className="max-w-lg mx-auto px-4 py-10">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 text-center relative overflow-hidden">
                        {/* bg deco */}
                        <div className="pointer-events-none absolute inset-0 opacity-[0.04] text-5xl select-none">
                            <span className="absolute top-3 left-6">🎉</span>
                            <span className="absolute top-10 right-8">✨</span>
                            <span className="absolute bottom-6 left-12">🎊</span>
                            <span className="absolute bottom-3 right-6">🌟</span>
                        </div>

                        {/* Icon */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-amber-200 animate-pulse">
                            <Clock size={40} className="text-white" />
                        </div>

                        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Đã ghi nhận yêu cầu! ⏳</h1>
                        <p className="text-gray-500 text-sm mb-6">Xin vui lòng chờ Admin kiểm tra giao dịch và xác nhận.</p>

                        {/* Booking code */}
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-5 mb-6 border border-cyan-200">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Mã đặt phòng</p>
                            <p className="text-3xl font-extrabold text-cyan-700 tracking-[0.2em]">{bookingCode}</p>
                        </div>

                        {/* Summary */}
                        <div className="text-left bg-gray-50 rounded-2xl p-5 space-y-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-12 rounded-xl overflow-hidden relative flex-shrink-0">
                                    <Image src={property.images[0]} alt={property.name} fill className="object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{property.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin size={10} className="text-cyan-500" /> {property.location}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white rounded-xl p-3">
                                    <p className="text-gray-400 font-semibold mb-0.5">Nhận phòng</p>
                                    <p className="font-bold text-gray-900">{fmtDate(checkIn)}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3">
                                    <p className="text-gray-400 font-semibold mb-0.5">Trả phòng</p>
                                    <p className="font-bold text-gray-900">{fmtDate(checkOut)}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                                <span className="font-bold text-gray-900">Tổng tiền</span>
                                <span className="text-lg font-extrabold text-gray-900">{fmtPrice(totalPrice)}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Đã cọc</span>
                                <span className="font-bold text-green-600">{fmtPrice(deposit)}đ ✓</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Thanh toán khi đến</span>
                                <span className="font-semibold text-gray-700">{fmtPrice(remaining)}đ</span>
                            </div>
                        </div>

                        {/* Bước tiếp */}
                        <div className="text-left space-y-2 mb-6">
                            <p className="font-bold text-gray-900 mb-3">📋 Tiến trình hiện tại</p>
                            {[
                                { color: "amber", n: 1, title: "Đang chờ duyệt cọc", sub: "Admin đang kiểm tra tài khoản, thường mất 15-30 phút." },
                                { color: "green", n: 2, title: `Thanh toán còn lại ${fmtPrice(remaining)}đ`, sub: "Thanh toán khi check-in" },
                                { color: "blue", n: 3, title: "Check-in & tận hưởng 🏡", sub: "Nhận phòng 14:00 · Trả phòng 12:00" },
                            ].map(s => (
                                <div key={s.n} className={`flex items-start gap-3 p-3 rounded-xl bg-${s.color}-50`}>
                                    <div className={`w-6 h-6 rounded-full bg-${s.color}-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>{s.n}</div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                                        <p className="text-xs text-gray-500">{s.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Link href="/trips" className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm text-center hover:bg-gray-200 transition-all">
                                📋 Đơn đặt của tôi
                            </Link>
                            <a
                                href="https://zalo.me/0333160365"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm text-center hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                            >
                                <MessageCircle size={16} /> Chat Zalo
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    // ──── Màn hình THANH TOÁN QR ────
    return (
        <main className="min-h-screen bg-gradient-to-b from-cyan-50/40 to-white">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href={`/${property.type}/${property.id}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={18} />
                        <span className="font-semibold text-sm">Quay lại</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Minh Phát Villa" width={32} height={32} className="rounded-full" />
                        <span className="font-bold text-gray-900 text-sm">Thanh toán đặt phòng</span>
                    </div>
                    <Shield size={16} className="text-green-500" />
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

                {/* ── Countdown ── */}
                <CountdownTimer seconds={timeLeft} urgent={timeLeft < 300} />

                {/* ── Thông tin phòng ── */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex gap-4 items-center">
                        <div className="w-24 h-18 rounded-2xl overflow-hidden relative flex-shrink-0 h-16">
                            <Image src={property.images[0]} alt={property.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                    {property.type}
                                </span>
                                <span className="text-xs font-bold flex items-center gap-0.5">
                                    <Star size={11} className="text-yellow-500 fill-yellow-500" /> {property.rating}
                                </span>
                            </div>
                            <h2 className="font-bold text-gray-900 truncate">{property.name}</h2>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={11} className="text-cyan-500" /> {property.location}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Calendar size={13} className="text-cyan-500" /> {nights} đêm</span>
                        <span className="flex items-center gap-1"><Users size={13} className="text-green-500" /> {guests} khách</span>
                        <span className="flex items-center gap-1"><BedDouble size={13} className="text-blue-500" /> {property.attributes.bedrooms} phòng ngủ</span>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Nhận phòng · 14:00</p>
                            <p className="font-bold text-gray-900 text-sm mt-0.5">{fmtDate(checkIn)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Trả phòng · 12:00</p>
                            <p className="font-bold text-gray-900 text-sm mt-0.5">{fmtDate(checkOut)}</p>
                        </div>
                    </div>
                </div>

                {/* ── Bảng giá ── */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <button
                        onClick={() => setShowDetails(d => !d)}
                        className="w-full flex items-center justify-between"
                    >
                        <span className="font-bold text-gray-900">💰 Chi tiết giá</span>
                        {showDetails ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>

                    {showDetails && (
                        <div className="mt-4 space-y-2 text-sm border-t border-gray-100 pt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>{fmtPrice(property.price.weekday)}đ × {nights} đêm</span>
                                <span className="font-semibold">{fmtPrice(totalPrice)}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí dịch vụ</span>
                                <span className="font-semibold text-green-600">Miễn phí</span>
                            </div>
                        </div>
                    )}

                    {/* Tổng + cọc */}
                    <div className="mt-4 space-y-2 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tổng tiền</span>
                            <span className="font-bold text-gray-900">{fmtPrice(totalPrice)}đ</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Thanh toán khi đến</span>
                            <span className="font-semibold">{fmtPrice(remaining)}đ</span>
                        </div>
                    </div>

                    {/* Cọc highlight */}
                    <div className="mt-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-rose-500 font-bold uppercase tracking-wider">Tiền cọc cần chuyển (50%)</p>
                                <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{fmtPrice(deposit)}<span className="text-base">đ</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-rose-400">Còn lại thanh toán</p>
                                <p className="text-sm font-bold text-gray-700">{fmtPrice(remaining)}đ</p>
                                <p className="text-xs text-gray-400">khi check-in</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── QR Code Thanh Toán ── */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm">🏦</div>
                        <h3 className="font-bold text-gray-900">Quét mã QR để chuyển khoản</h3>
                    </div>

                    {/* QR Image */}
                    <div className="flex flex-col items-center">
                        <div className="relative bg-white rounded-3xl p-4 shadow-lg border-2 border-cyan-200 mb-4">
                            {/* QR từ VietQR */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={qrUrl}
                                alt="QR chuyển khoản"
                                width={240}
                                height={240}
                                className="rounded-2xl"
                                style={{ imageRendering: "pixelated" }}
                            />
                            {/* bank logo overlay */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-3 py-1 shadow-md border border-gray-100">
                                <span className="text-xs font-extrabold text-green-700">{BANK_INFO.bankName}</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-3 mb-5 text-center">
                            Dùng app ngân hàng bất kỳ · MB Bank · VCB · TPBank · v.v.
                        </p>
                    </div>

                    {/* Bank info rows */}
                    <div className="space-y-2">
                        {[
                            { label: "Ngân hàng", value: BANK_INFO.bankName },
                            { label: "Số tài khoản", value: BANK_INFO.accountNumber },
                            { label: "Chủ tài khoản", value: BANK_INFO.accountName },
                            { label: "Số tiền", value: `${fmtPrice(deposit)}đ` },
                            { label: "Nội dung CK", value: transferNote },
                        ].map(row => (
                            <div key={row.label} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-semibold">{row.label}</p>
                                    <p className="font-bold text-gray-900 text-sm">{row.value}</p>
                                </div>
                                <CopyButton text={row.value} label="Copy" />
                            </div>
                        ))}
                    </div>

                    {/* Lưu ý nội dung chuyển khoản */}
                    <div className="mt-4 flex items-start gap-2.5 bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            <strong>Lưu ý:</strong> Nhập đúng nội dung chuyển khoản <strong className="text-amber-800">{transferNote}</strong> để hệ thống tự động xác nhận đặt phòng.
                        </p>
                    </div>
                </div>

                {/* ── Thông tin khách hàng ── */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm">👤</div>
                        <h3 className="font-bold text-gray-900">Thông tin khách hàng</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Họ và tên *</label>
                            <input
                                type="text"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder="Nguyễn Văn A"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Số điện thoại *</label>
                            <div className="flex">
                                <select className="px-2 py-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-700 font-bold text-xs focus:outline-none">
                                    <option value="+84">🇻🇳 +84</option>
                                </select>
                                <input
                                    type="tel"
                                    value={guestPhone}
                                    onChange={(e) => setGuestPhone(e.target.value)}
                                    placeholder="901 234 567"
                                    className="w-full px-4 py-3 rounded-r-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Nút xác nhận đã chuyển ── */}
                <div className="space-y-3">
                    <button
                        onClick={handleConfirm}
                        className="w-full py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-extrabold text-lg shadow-xl shadow-green-200 hover:shadow-2xl hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 size={22} />
                        Tôi đã chuyển khoản thành công
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-2 bg-amber-50 rounded-lg py-2 border border-amber-100">
                        Hệ thống sẽ chuyển sang trạng thái <strong>Chờ Xác Nhận</strong> để Admin đối soát cọc.
                    </p>
                </div>

                {/* ── Cam kết ── */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-5 border border-cyan-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={15} className="text-cyan-600" />
                        <span className="font-bold text-cyan-800 text-sm">Cam kết của Minh Phát Villa</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-cyan-700">
                        {[
                            "Giá không đổi sau khi đặt",
                            "Đổi miễn phí trước 10 ngày",
                            "Xác nhận qua Zalo < 30 phút",
                            "Hỗ trợ 24/7 mọi lúc",
                        ].map(t => (
                            <div key={t} className="flex items-center gap-1.5">
                                <Check size={12} className="text-green-500 flex-shrink-0" />
                                <span>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Liên hệ hỗ trợ ── */}
                <div className="flex gap-3 pb-10">
                    <a href="tel:0333160365"
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm">
                        <Phone size={16} className="text-green-500" /> Gọi ngay
                    </a>
                    <a href="https://zalo.me/0333160365" target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm hover:shadow-lg transition-all">
                        <MessageCircle size={16} /> Chat Zalo
                    </a>
                </div>
            </div>
        </main>
    );
}

// ── Wrap Suspense (bắt buộc khi dùng useSearchParams) ──
export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={36} className="animate-spin text-cyan-500" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
