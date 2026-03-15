"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Search, Filter, Calendar, ChevronDown, X, Eye,
    Check, Clock, XCircle, Phone, MessageCircle,
    Download, RefreshCw, MoreHorizontal, ArrowUpDown,
    DollarSign, CalendarCheck, AlertCircle, Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Interface Booking ──
interface Booking {
    id: string;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    propertyName: string;
    propertyType: "villa" | "homestay" | "nha-pho";
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
    totalPrice: number;
    deposit: number;
    status: "confirmed" | "pending" | "checked_in" | "completed" | "cancelled";
    paymentMethod: string;
    createdAt: string;
    note: string;
    rescheduleRequested?: boolean;
    newCheckIn?: string;
    newCheckOut?: string;
    rescheduleCount?: number;
}

// ── Helper: chuyển dữ liệu DB → Booking ──
function rowToBooking(row: Record<string, unknown>): Booking {
    const checkIn = row.check_in as string;
    const checkOut = row.check_out as string;
    const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    const propertyId = (row.property_id as string) || "";
    const propertyType = propertyId.startsWith("villa") ? "villa" : propertyId.startsWith("nha-pho") ? "nha-pho" : "homestay";

    return {
        id: row.id as string,
        guestName: (row.guest_name as string) || "",
        guestPhone: (row.guest_phone as string) || "",
        guestEmail: (row.guest_email as string) || "",
        propertyName: (row.property_name as string) || "",
        propertyType,
        checkIn,
        checkOut,
        nights,
        guests: (row.guest_count as number) || 1,
        totalPrice: Number(row.total_price) || 0,
        deposit: Number(row.deposit_amount) || 0,
        status: (row.status as Booking["status"]) || "pending",
        paymentMethod: (row.payment_method as string) || "Chờ thanh toán",
        createdAt: (row.created_at as string) || "",
        note: (row.notes as string) || "",
        rescheduleRequested: !!row.reschedule_requested,
        newCheckIn: (row.new_check_in as string) || "",
        newCheckOut: (row.new_check_out as string) || "",
        rescheduleCount: Number(row.reschedule_count) || 0,
    };
}

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    confirmed: { label: "Đã xác nhận", cls: "bg-green-100 text-green-700", icon: <Check size={12} /> },
    pending: { label: "Chờ thanh toán", cls: "bg-amber-100 text-amber-700", icon: <Clock size={12} /> },
    checked_in: { label: "Đang ở", cls: "bg-blue-100 text-blue-700", icon: <CalendarCheck size={12} /> },
    completed: { label: "Hoàn thành", cls: "bg-gray-100 text-gray-700", icon: <Check size={12} /> },
    cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700", icon: <XCircle size={12} /> },
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // ── Lấy dữ liệu bookings từ Supabase ──
    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("bookings")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setBookings((data || []).map(rowToBooking));
        } catch (err) {
            console.error("Lỗi khi tải bookings:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // ── Cập nhật trạng thái đơn ──
    const updateBookingStatus = async (bookingId: string, newStatus: string) => {
        try {
            const updates: Record<string, unknown> = { status: newStatus };
            if (newStatus === "confirmed") {
                updates.payment_method = "Chuyển khoản TPBank";
            }

            const { error } = await supabase
                .from("bookings")
                .update(updates)
                .eq("id", bookingId);

            if (error) throw error;

            // Cập nhật local state
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: newStatus as Booking["status"] } : b)
            );
            setSelectedBooking(null);
            alert(newStatus === "confirmed" ? "✅ Đã xác nhận đơn!" : "❌ Đã hủy đơn!");
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    // ── Xử lý Yêu cầu dời lịch ──
    const handleReschedule = async (bookingId: string, accept: boolean) => {
        try {
            const updates: Record<string, unknown> = {
                reschedule_requested: false,
                new_check_in: null,
                new_check_out: null,
            };

            if (accept && selectedBooking) {
                updates.check_in = selectedBooking.newCheckIn;
                updates.check_out = selectedBooking.newCheckOut;
                updates.reschedule_count = (selectedBooking.rescheduleCount || 0) + 1;
            }

            const { error } = await supabase
                .from("bookings")
                .update(updates)
                .eq("id", bookingId);

            if (error) throw error;

            alert(accept ? "✅ Đã CHẤP NHẬN yêu cầu dời lịch" : "❌ Đã TỪ CHỐI yêu cầu dời lịch");
            fetchBookings();
            setSelectedBooking(null);
        } catch (err) {
            console.error("Lỗi duyệt dời lịch:", err);
            alert("Đã xảy ra lỗi!");
        }
    };

    const fmtPrice = (n: number) => n.toLocaleString("vi-VN");
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

    const filtered = useMemo(() => {
        return bookings.filter(b => {
            const matchSearch = b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = filterStatus === "all" || b.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [bookings, searchTerm, filterStatus]);

    // Thống kê
    const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0);
    const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
    const pendingCount = bookings.filter(b => b.status === "pending").length;

    // ── Loading state ──
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="ml-3 text-gray-500 font-medium">Đang tải đơn đặt phòng...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Calendar size={18} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-gray-900">{bookings.length}</p>
                        <p className="text-xs text-gray-500">Tổng đơn</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Clock size={18} className="text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-amber-600">{pendingCount}</p>
                        <p className="text-xs text-gray-500">Chờ thanh toán</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                        <Check size={18} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-green-600">{confirmedCount}</p>
                        <p className="text-xs text-gray-500">Đã xác nhận</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <DollarSign size={18} className="text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-gray-900">{fmtPrice(totalRevenue)}đ</p>
                        <p className="text-xs text-gray-500">Tổng doanh thu</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn, tên khách, nơi ở..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none w-full placeholder-gray-400"
                    />
                    {searchTerm && (<button onClick={() => setSearchTerm("")}><X size={14} className="text-gray-400" /></button>)}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {[
                        { key: "all", label: "Tất cả" },
                        { key: "pending", label: "Chờ TT" },
                        { key: "confirmed", label: "Xác nhận" },
                        { key: "checked_in", label: "Đang ở" },
                        { key: "completed", label: "Hoàn thành" },
                        { key: "cancelled", label: "Đã hủy" },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilterStatus(f.key)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === f.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Nút làm mới */}
                <button
                    onClick={fetchBookings}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                    title="Làm mới dữ liệu"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                {["Mã đơn", "Khách hàng", "Nơi ở", "Check-in", "Check-out", "Tổng tiền", "Trạng thái", ""].map(h => (
                                    <th key={h} className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12">
                                        <span className="text-4xl">📭</span>
                                        <p className="font-bold text-gray-700 mt-3">Không có đơn nào</p>
                                    </td>
                                </tr>
                            ) : filtered.map(b => {
                                const st = statusConfig[b.status] || statusConfig.pending;
                                return (
                                    <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setSelectedBooking(b)}>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-cyan-600">{b.id}</span>
                                            {b.rescheduleRequested && (
                                                <div className="mt-1 inline-block animate-pulse">
                                                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                        ⏳ Đổi lịch
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-gray-900">{b.guestName}</p>
                                            <p className="text-xs text-gray-400">{b.guestPhone}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${b.propertyType === "villa" ? "bg-cyan-500" : b.propertyType === "homestay" ? "bg-violet-500" : "bg-amber-500"}`} />
                                                <span className="text-sm text-gray-700">{b.propertyName}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(b.checkIn)}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(b.checkOut)}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-gray-900">{fmtPrice(b.totalPrice)}đ</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${st.cls}`}>
                                                {st.icon} {st.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                                                <Eye size={16} className="text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedBooking(null)}>
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Chi tiết đơn #{selectedBooking.id}</h3>
                                <p className="text-xs text-gray-400 mt-1">Ngày tạo: {fmtDate(selectedBooking.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full ${statusConfig[selectedBooking.status]?.cls || ""}`}>
                                    {statusConfig[selectedBooking.status]?.icon}
                                    {statusConfig[selectedBooking.status]?.label}
                                </span>
                                <span className="text-xs text-gray-400">{selectedBooking.nights} đêm · {selectedBooking.guests} khách</span>
                            </div>

                            {/* Guest info */}
                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin khách</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><p className="text-xs text-gray-400">Họ tên</p><p className="font-bold text-gray-900 text-sm">{selectedBooking.guestName}</p></div>
                                    <div><p className="text-xs text-gray-400">SĐT</p><p className="font-bold text-gray-900 text-sm">{selectedBooking.guestPhone}</p></div>
                                    {selectedBooking.guestEmail && <div className="col-span-2"><p className="text-xs text-gray-400">Email</p><p className="font-bold text-gray-900 text-sm">{selectedBooking.guestEmail}</p></div>}
                                </div>
                                {/* Contact buttons */}
                                <div className="flex gap-2 pt-2">
                                    <a href={`tel:${selectedBooking.guestPhone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200">
                                        <Phone size={12} /> Gọi ngay
                                    </a>
                                    <a href={`https://zalo.me/${selectedBooking.guestPhone}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">
                                        <MessageCircle size={12} /> Zalo
                                    </a>
                                </div>
                            </div>

                            {/* Property + Dates */}
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nơi ở & Ngày</p>
                                <p className="font-bold text-gray-900">{selectedBooking.propertyName}</p>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div className="bg-white rounded-xl p-3"><p className="text-xs text-gray-400">Nhận phòng</p><p className="font-bold text-sm">{fmtDate(selectedBooking.checkIn)}</p></div>
                                    <div className="bg-white rounded-xl p-3"><p className="text-xs text-gray-400">Trả phòng</p><p className="font-bold text-sm">{fmtDate(selectedBooking.checkOut)}</p></div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thanh toán</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-600">Tổng tiền</span><span className="font-bold">{fmtPrice(selectedBooking.totalPrice)}đ</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Tiền cọc</span><span className="font-bold text-green-600">{fmtPrice(selectedBooking.deposit)}đ</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Còn lại</span><span className="font-bold">{fmtPrice(selectedBooking.totalPrice - selectedBooking.deposit)}đ</span></div>
                                    <div className="flex justify-between pt-2 border-t border-green-200"><span className="text-gray-600">Phương thức</span><span className="font-bold">{selectedBooking.paymentMethod}</span></div>
                                </div>
                            </div>

                            {/* Note */}
                            {selectedBooking.note && (
                                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-2">
                                    <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-700">Ghi chú:</p>
                                        <p className="text-sm text-amber-800">{selectedBooking.note}</p>
                                    </div>
                                </div>
                            )}

                            {/* Alert Dời lịch */}
                            {selectedBooking.rescheduleRequested && (
                                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                                    <h4 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                                        <Calendar size={16} /> Khách yêu cầu dời lịch
                                    </h4>
                                    <p className="text-sm text-orange-800 mb-3">Khách hàng cần đổi lịch trình sang:</p>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-white rounded-xl p-3 border border-orange-100">
                                            <p className="text-xs text-gray-400">Check-in Mới</p>
                                            <p className="font-bold text-sm text-orange-900">{selectedBooking.newCheckIn ? fmtDate(selectedBooking.newCheckIn) : "—"}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 border border-orange-100">
                                            <p className="text-xs text-gray-400">Check-out Mới</p>
                                            <p className="font-bold text-sm text-orange-900">{selectedBooking.newCheckOut ? fmtDate(selectedBooking.newCheckOut) : "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReschedule(selectedBooking.id, true)}
                                            className="flex-1 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                                        >
                                            Chấp nhận Đổi
                                        </button>
                                        <button
                                            onClick={() => handleReschedule(selectedBooking.id, false)}
                                            className="flex-1 py-2 bg-white text-orange-600 border border-orange-300 rounded-xl font-bold hover:bg-orange-100 transition-colors"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action buttons — chỉ hiển thị khi đơn đang chờ */}
                            {selectedBooking.status === "pending" && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => updateBookingStatus(selectedBooking.id, "confirmed")}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                                    >
                                        <Check size={16} /> Đã nhận cọc (Xác nhận)
                                    </button>
                                    <button
                                        onClick={() => updateBookingStatus(selectedBooking.id, "cancelled")}
                                        className="py-3 px-5 rounded-xl bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-all"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
