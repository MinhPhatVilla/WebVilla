"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Loader2, Calendar, MapPin, Users,
    Clock, CheckCircle2, XCircle, AlertCircle,
    Luggage, Search, Filter, MessageCircle
} from "lucide-react";

// ── Interface cho booking ──
interface Booking {
    id: string;
    property_id: string;
    property_name: string;
    guest_name: string;
    guest_phone: string;
    guest_email: string;
    guest_count: number;
    check_in: string;
    check_out: string;
    total_price: number;
    deposit_amount?: number;
    status: "pending" | "confirmed" | "cancelled";
    notes: string;
    created_at: string;
    reschedule_requested?: boolean;
    new_check_in?: string;
    new_check_out?: string;
    reschedule_count?: number;
}

// ========== 🧳 TRANG CHUYẾN ĐI ==========
export default function TripsPage() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");
    const [searchQuery, setSearchQuery] = useState("");

    // State Modal dời lịch
    const [rescheduleModal, setRescheduleModal] = useState<{ id: string; newCheckIn: string; newCheckOut: string } | null>(null);
    const [submittingReschedule, setSubmittingReschedule] = useState(false);
    const [newPriceDetail, setNewPriceDetail] = useState<{ total: number, originalDeposit: number, difference: number } | null>(null);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    // Tính tiền phòng cho lịch mới
    useEffect(() => {
        const calculateNewPrice = async () => {
            if (!rescheduleModal || !rescheduleModal.newCheckIn || !rescheduleModal.newCheckOut) {
                setNewPriceDetail(null);
                return;
            }

            const dateIn = new Date(rescheduleModal.newCheckIn);
            const dateOut = new Date(rescheduleModal.newCheckOut);

            if (dateIn >= dateOut) {
                setNewPriceDetail(null);
                return;
            }

            const booking = bookings.find(b => b.id === rescheduleModal.id);
            if (!booking) return;

            setCalculatingPrice(true);
            try {
                const { data, error } = await supabase
                    .from('properties')
                    .select('price_weekday, price_weekend')
                    .eq('id', booking.property_id)
                    .single();

                if (error || !data) throw error;

                let total = 0;
                const current = new Date(dateIn);
                while (current < dateOut) {
                    if (current.getDay() === 6) { // Thứ 7
                        total += data.price_weekend || data.price_weekday;
                    } else {
                        total += data.price_weekday;
                    }
                    current.setDate(current.getDate() + 1);
                }

                const originalDeposit = booking.deposit_amount || booking.total_price / 2;

                setNewPriceDetail({
                    total,
                    originalDeposit,
                    difference: total - originalDeposit
                });

            } catch (error) {
                console.error(error);
                setNewPriceDetail(null);
            } finally {
                setCalculatingPrice(false);
            }
        };

        calculateNewPrice();
    }, [rescheduleModal?.newCheckIn, rescheduleModal?.newCheckOut, rescheduleModal?.id, bookings]);

    // Redirect nếu chưa đăng nhập
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Lấy danh sách bookings của user
    useEffect(() => {
        const fetchBookings = async () => {
            if (!profile?.email) return;

            try {
                const { data, error } = await supabase
                    .from("bookings")
                    .select("*")
                    .eq("guest_email", profile.email)
                    .order("created_at", { ascending: false });

                if (error) {
                    console.error("Lỗi lấy bookings:", error);
                } else {
                    setBookings(data || []);
                }
            } catch (err) {
                console.error("Lỗi:", err);
            } finally {
                setLoadingBookings(false);
            }
        };

        if (profile) fetchBookings();
    }, [profile]);

    // === Filter bookings ===
    const now = new Date();
    const filteredBookings = bookings.filter((b) => {
        // Filter theo trạng thái
        if (activeFilter === "upcoming") {
            // Sắp tới: chưa đi hoặc đang đi (chưa hết check_out)
            return new Date(b.check_out) >= now && b.status !== "cancelled";
        }
        if (activeFilter === "past") {
            // Đã qua: đã đi xong (đã qua check_out)
            return new Date(b.check_out) < now && b.status !== "cancelled";
        }
        if (activeFilter === "cancelled") {
            return b.status === "cancelled";
        }
        return true;
    }).filter((b) => {
        // Filter theo search
        if (!searchQuery) return true;
        return b.property_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.id.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // === Status badge ===
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle2 size={12} /> Đã xác nhận
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <XCircle size={12} /> Đã hủy
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        <AlertCircle size={12} /> Chờ xác nhận
                    </span>
                );
        }
    };

    // === Tính số đêm ===
    const getNights = (checkIn: string, checkOut: string) => {
        const d1 = new Date(checkIn);
        const d2 = new Date(checkOut);
        return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    };

    // === Kiểm tra có được đổi lịch hay không (trước ngày đi > 10 ngày) ===
    const canChangeSchedule = (checkIn: string) => {
        const checkInDate = new Date(checkIn);
        const daysDiff = (checkInDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 10;
    };

    // ====== Xử lý dời lịch ======
    const handleRescheduleSubmit = async () => {
        if (!rescheduleModal || !rescheduleModal.newCheckIn || !rescheduleModal.newCheckOut) return;
        setSubmittingReschedule(true);
        try {
            const { error } = await supabase
                .from("bookings")
                .update({
                    reschedule_requested: true,
                    new_check_in: rescheduleModal.newCheckIn,
                    new_check_out: rescheduleModal.newCheckOut,
                })
                .eq("id", rescheduleModal.id);

            if (error) throw error;

            setBookings(prev => prev.map(b => b.id === rescheduleModal.id ? {
                ...b, reschedule_requested: true, new_check_in: rescheduleModal.newCheckIn, new_check_out: rescheduleModal.newCheckOut
            } : b));

            // --- TÌM THÔNG TIN ĐƠN, BÁO TELEGRAM ---
            const bookingDetail = bookings.find(b => b.id === rescheduleModal.id);
            if (bookingDetail) {
                const checkInDateStr = new Date(bookingDetail.check_in).toLocaleDateString('vi-VN');
                const checkOutDateStr = new Date(bookingDetail.check_out).toLocaleDateString('vi-VN');
                const newInStr = new Date(rescheduleModal.newCheckIn).toLocaleDateString('vi-VN');
                const newOutStr = new Date(rescheduleModal.newCheckOut).toLocaleDateString('vi-VN');

                const msg = `🔄 <b>YÊU CẦU DỜI LỊCH</b> 🔄\n\n` +
                    `🔖 Mã đơn: <b>#${bookingDetail.id}</b>\n` +
                    `👤 Khách: <b>${bookingDetail.guest_name}</b>\n` +
                    `🏡 Căn: ${bookingDetail.property_name}\n` +
                    `⚠️ Lịch cũ: ${checkInDateStr} -> ${checkOutDateStr}\n` +
                    `🎯 <b>Lịch mới: ${newInStr} -> ${newOutStr}</b>\n\n` +
                    `Vui lòng vào Dashboard để duyệt đơn.`;

                fetch('/api/telegram', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg })
                }).catch(err => console.error(err));
            }

            setRescheduleModal(null);
            alert("Đã gửi yêu cầu dời lịch thành công! Vui lòng liên hệ Zalo quản gia để được hỗ trợ nhanh nhất.");
        } catch (err) {
            console.error("Lỗi:", err);
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
        } finally {
            setSubmittingReschedule(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
            {/* ===== HEADER ===== */}
            <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-semibold text-sm">Quay lại</span>
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">MP</span>
                        </div>
                        <span className="hidden sm:block text-sm font-bold text-gray-900">Minh Phát Villa</span>
                    </Link>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* ===== TITLE ===== */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Luggage className="text-cyan-600" size={32} />
                        Đơn booking
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Quản lý đơn đặt phòng và chuyến đi của bạn
                    </p>
                </div>

                {/* ===== FILTER TABS + SEARCH ===== */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 rounded-full p-1 gap-1">
                        {[
                            { key: "all", label: "Tất cả", count: bookings.length },
                            { key: "upcoming", label: "Sắp tới", count: bookings.filter(b => new Date(b.check_out) >= now && b.status !== "cancelled").length },
                            { key: "past", label: "Đã qua", count: bookings.filter(b => new Date(b.check_out) < now && b.status !== "cancelled").length },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key as typeof activeFilter)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === tab.key
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm đơn booking..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 text-sm focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* ===== DANH SÁCH BOOKINGS ===== */}
                {loadingBookings ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 md:p-6 hover:shadow-xl transition-all hover:-translate-y-0.5 group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Thông tin property */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                                                    {booking.property_name}
                                                </h3>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Mã đơn: <span className="font-mono font-bold">{booking.id}</span>
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {getStatusBadge(booking.status)}
                                                {booking.status === "confirmed" && (
                                                    <div className="flex flex-col items-end gap-1">
                                                        {booking.reschedule_requested && (
                                                            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md mb-1">
                                                                ⏳ Đang duyệt dời lịch
                                                            </span>
                                                        )}
                                                        {(booking.reschedule_count || 0) >= 1 ? (
                                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                                                                Đã dùng hết quyền dời lịch
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => setRescheduleModal({ id: booking.id, newCheckIn: "", newCheckOut: "" })}
                                                                disabled={!canChangeSchedule(booking.check_in) || booking.reschedule_requested}
                                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all border ${canChangeSchedule(booking.check_in) && !booking.reschedule_requested
                                                                    ? "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300 active:scale-95"
                                                                    : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"
                                                                    }`}
                                                                title={!canChangeSchedule(booking.check_in) ? "Chỉ hỗ trợ dời lịch khi còn hơn 10 ngày trước khi Check-in" : booking.reschedule_requested ? "Đang có yêu cầu dời lịch" : "Còn 1 lần dời lịch duy nhất"}
                                                            >
                                                                Thay đổi lịch trình
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Chi tiết */}
                                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-cyan-500" />
                                                <span>
                                                    {new Date(booking.check_in).toLocaleDateString("vi-VN")} → {new Date(booking.check_out).toLocaleDateString("vi-VN")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-blue-500" />
                                                <span>{getNights(booking.check_in, booking.check_out)} đêm</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} className="text-green-500" />
                                                <span>{booking.guest_count} khách</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Giá */}
                                    <div className="text-right flex flex-col items-end md:items-end w-full md:w-auto mt-4 md:mt-0">
                                        <div className="bg-gray-50 rounded-xl p-3.5 inline-block text-left border border-gray-100 min-w-[220px]">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs text-gray-500 font-medium">Tổng tiền</span>
                                                <span className="text-sm font-bold text-gray-900">{booking.total_price.toLocaleString("vi-VN")}đ</span>
                                            </div>
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-xs text-gray-500 font-medium">Đã cọc 50%</span>
                                                <span className="text-sm text-green-600 font-bold">
                                                    {(booking.deposit_amount || booking.total_price / 2).toLocaleString("vi-VN")}đ
                                                </span>
                                            </div>
                                            <div className="border-t border-gray-200 mt-2 pt-2 flex flex-col">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-bold text-rose-600">Còn lại</span>
                                                    <span className="text-lg font-extrabold text-rose-600">
                                                        {(booking.total_price - (booking.deposit_amount || booking.total_price / 2)).toLocaleString("vi-VN")}đ
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 italic text-right block">
                                                    Thanh toán cho quản gia khi Check-in
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {booking.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-sm text-gray-500 italic">📝 {booking.notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-100">
                        <div className="text-6xl mb-4">🧳</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {activeFilter === "all"
                                ? "Chưa có đơn booking nào"
                                : activeFilter === "upcoming"
                                    ? "Không có đơn sắp tới"
                                    : "Chưa có lịch sử booking"
                            }
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Hãy đặt phòng Villa hoặc Homestay để bắt đầu chuyến đi!
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        >
                            <MapPin size={18} />
                            Khám phá nơi ở
                        </Link>
                    </div>
                )}
            </div>

            {/* ===== MODAL DỜI LỊCH ===== */}
            {rescheduleModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setRescheduleModal(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <XCircle size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-cyan-100 text-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Yêu cầu dời lịch</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Bạn vui lòng chọn ngày mới. Yêu cầu sẽ được admin duyệt và phản hồi.
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày Check-in mới</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={rescheduleModal.newCheckIn}
                                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, newCheckIn: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày Check-out mới</label>
                                <input
                                    type="date"
                                    min={rescheduleModal.newCheckIn || new Date().toISOString().split("T")[0]}
                                    value={rescheduleModal.newCheckOut}
                                    onChange={(e) => setRescheduleModal({ ...rescheduleModal, newCheckOut: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {calculatingPrice ? (
                            <div className="flex justify-center py-4 mb-6"><Loader2 className="w-6 h-6 animate-spin text-cyan-500" /></div>
                        ) : newPriceDetail ? (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 animate-fadeIn">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">Tạm tính Chi phí Mới</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Tổng tiền phòng mới</span>
                                        <span className="font-semibold">{newPriceDetail.total.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Cọc cũ (Giữ nguyên)</span>
                                        <span className="font-semibold">- {newPriceDetail.originalDeposit.toLocaleString("vi-VN")}đ</span>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        {newPriceDetail.difference > 0 ? (
                                            <div className="flex justify-between items-center text-rose-600">
                                                <span className="font-bold">Còn thanh toán lúc Check-in</span>
                                                <span className="text-lg font-extrabold">{newPriceDetail.difference.toLocaleString("vi-VN")}đ</span>
                                            </div>
                                        ) : newPriceDetail.difference < 0 ? (
                                            <div className="flex justify-between items-center text-blue-600">
                                                <span className="font-bold">Số dư hoàn trả tại Villa</span>
                                                <span className="text-lg font-extrabold">{Math.abs(newPriceDetail.difference).toLocaleString("vi-VN")}đ</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center text-gray-800">
                                                <span className="font-bold">Còn thanh toán lúc Check-in</span>
                                                <span className="text-lg font-extrabold">0đ</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
                            <strong>💡 Mẹo:</strong> Hãy nhắn tin cho Quản gia qua Zalo trước để kiểm tra lịch trống thay vì chờ nhé!
                            <a href="https://zalo.me/0333160365" target="_blank" className="mt-2 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
                                <MessageCircle size={16} /> Liên hệ Zalo Quản Gia
                            </a>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRescheduleModal(null)}
                                className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleRescheduleSubmit}
                                disabled={submittingReschedule || !rescheduleModal.newCheckIn || !rescheduleModal.newCheckOut}
                                className="flex-1 py-3 text-white font-bold bg-cyan-600 rounded-xl hover:bg-cyan-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {submittingReschedule ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gửi yêu cầu"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
