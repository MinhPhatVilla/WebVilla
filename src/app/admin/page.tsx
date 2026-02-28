"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    TrendingUp, TrendingDown, DollarSign, Building2,
    CalendarCheck, Users, ArrowUpRight, ArrowDownRight,
    Eye, Home, BedDouble, Star, MoreHorizontal,
    ChevronRight, Clock, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Interfaces ──
interface DashboardStats {
    totalRevenue: number;
    totalProperties: number;
    totalBookings: number;
    totalUsers: number;
}

interface RecentBooking {
    id: string;
    guest: string;
    property: string;
    checkIn: string;
    checkOut: string;
    total: string;
    status: string;
}

interface TopProperty {
    name: string;
    bookings: number;
    revenue: string;
    rating: number;
    occupancy: number;
}

const statusMap: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Đã xác nhận", cls: "bg-green-100 text-green-700" },
    pending: { label: "Chờ thanh toán", cls: "bg-amber-100 text-amber-700" },
    cancelled: { label: "Đã hủy", cls: "bg-red-100 text-red-700" },
    checked_in: { label: "Đang ở", cls: "bg-blue-100 text-blue-700" },
    completed: { label: "Hoàn thành", cls: "bg-gray-100 text-gray-700" },
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0, totalProperties: 0, totalBookings: 0, totalUsers: 0,
    });
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [topProperties, setTopProperties] = useState<TopProperty[]>([]);

    const fmtPrice = (n: number) => n.toLocaleString("vi-VN");
    const fmtDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    };

    // ── Fetch toàn bộ dữ liệu dashboard ──
    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);

            // Lấy song song 4 queries
            const [propertiesRes, bookingsRes, usersRes] = await Promise.all([
                supabase.from("properties").select("id, name, rating, reviews"),
                supabase.from("bookings").select("*").order("created_at", { ascending: false }),
                supabase.from("users").select("id"),
            ]);

            const properties = propertiesRes.data || [];
            const bookings = bookingsRes.data || [];
            const users = usersRes.data || [];

            // Tính doanh thu (chỉ đơn không bị hủy)
            const totalRevenue = bookings
                .filter((b: Record<string, unknown>) => b.status !== "cancelled")
                .reduce((sum: number, b: Record<string, unknown>) => sum + (Number(b.total_price) || 0), 0);

            // Stats
            setStats({
                totalRevenue,
                totalProperties: properties.length,
                totalBookings: bookings.length,
                totalUsers: users.length,
            });

            // Recent bookings (5 đơn gần nhất)
            setRecentBookings(
                bookings.slice(0, 5).map((b: Record<string, unknown>) => ({
                    id: b.id as string,
                    guest: b.guest_name as string,
                    property: b.property_name as string,
                    checkIn: fmtDate(b.check_in as string),
                    checkOut: fmtDate(b.check_out as string),
                    total: `${fmtPrice(Number(b.total_price) || 0)}đ`,
                    status: b.status as string,
                }))
            );

            // Top properties (theo số booking + doanh thu)
            const propertyStats: Record<string, { bookings: number; revenue: number }> = {};
            bookings
                .filter((b: Record<string, unknown>) => b.status !== "cancelled")
                .forEach((b: Record<string, unknown>) => {
                    const pid = b.property_id as string;
                    if (!propertyStats[pid]) propertyStats[pid] = { bookings: 0, revenue: 0 };
                    propertyStats[pid].bookings += 1;
                    propertyStats[pid].revenue += Number(b.total_price) || 0;
                });

            const topProps = properties
                .map((p: Record<string, unknown>) => {
                    const s = propertyStats[p.id as string] || { bookings: 0, revenue: 0 };
                    return {
                        name: p.name as string,
                        bookings: s.bookings,
                        revenue: `${fmtPrice(s.revenue)}đ`,
                        rating: Number(p.rating) || 0,
                        occupancy: s.bookings > 0 ? Math.min(Math.round((s.bookings / 10) * 100), 100) : 0,
                    };
                })
                .sort((a: TopProperty, b: TopProperty) => b.bookings - a.bookings)
                .slice(0, 3);

            setTopProperties(topProps);
        } catch (err) {
            console.error("Lỗi khi tải dashboard:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // ── Loading state ──
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="ml-3 text-gray-500 font-medium">Đang tải dashboard...</span>
            </div>
        );
    }

    // ── Stats cards config ──
    const statsCards = [
        { label: "Doanh thu", value: `${fmtPrice(stats.totalRevenue)}đ`, icon: DollarSign, lightBg: "bg-green-50", lightText: "text-green-600" },
        { label: "Tổng nơi ở", value: `${stats.totalProperties}`, icon: Building2, lightBg: "bg-cyan-50", lightText: "text-cyan-600" },
        { label: "Đơn đặt phòng", value: `${stats.totalBookings}`, icon: CalendarCheck, lightBg: "bg-violet-50", lightText: "text-violet-600" },
        { label: "Người dùng", value: `${stats.totalUsers}`, icon: Users, lightBg: "bg-amber-50", lightText: "text-amber-600" },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">Xin chào, Admin! 👋</h2>
                    <p className="text-gray-500 text-sm mt-1">Đây là tổng quan hệ thống hôm nay</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchDashboard}
                        className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                        title="Làm mới dữ liệu"
                    >
                        <RefreshCw size={16} />
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statsCards.map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-11 h-11 rounded-xl ${s.lightBg} flex items-center justify-center`}>
                                    <Icon size={20} className={s.lightText} />
                                </div>
                            </div>
                            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Top Properties */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-gray-900">📋 Đơn đặt gần đây</h3>
                        <Link href="/admin/bookings" className="text-cyan-600 text-sm font-semibold hover:underline flex items-center gap-0.5">
                            Xem tất cả <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Mã</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Khách</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Nơi ở</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Ngày</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Tổng</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">TT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-400">Chưa có đơn đặt phòng</td>
                                    </tr>
                                ) : recentBookings.map(b => (
                                    <tr key={b.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-3 py-3"><span className="text-sm font-bold text-cyan-600">{b.id}</span></td>
                                        <td className="px-3 py-3"><span className="text-sm font-semibold text-gray-900">{b.guest}</span></td>
                                        <td className="px-3 py-3"><span className="text-sm text-gray-600">{b.property}</span></td>
                                        <td className="px-3 py-3"><span className="text-sm text-gray-500">{b.checkIn} → {b.checkOut}</span></td>
                                        <td className="px-3 py-3"><span className="text-sm font-bold text-gray-900">{b.total}</span></td>
                                        <td className="px-3 py-3">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusMap[b.status]?.cls || ""}`}>
                                                {statusMap[b.status]?.label || b.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Properties */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-gray-900">🏆 Top nơi ở</h3>
                        <Link href="/admin/properties" className="text-cyan-600 text-sm font-semibold hover:underline flex items-center gap-0.5">
                            Xem tất cả <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {topProperties.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">Chưa có dữ liệu</p>
                        ) : topProperties.map((p, i) => (
                            <div key={p.name} className="flex items-center gap-4">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${i === 0 ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                                    i === 1 ? "bg-gradient-to-br from-slate-400 to-slate-500" :
                                        "bg-gradient-to-br from-amber-600 to-amber-700"
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                        <span className="flex items-center gap-0.5">
                                            <Star size={10} className="text-yellow-500 fill-yellow-500" /> {p.rating}
                                        </span>
                                        <span>{p.bookings} đơn</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 text-sm">{p.revenue}</p>
                                    <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1.5">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                            style={{ width: `${p.occupancy}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: "🏠", title: "Thêm nơi ở", desc: "Tạo villa/homestay mới", href: "/admin/properties", color: "from-cyan-50 to-blue-50 border-cyan-200" },
                    { icon: "📅", title: "Lịch đặt phòng", desc: "Xem lịch tổng quan", href: "/admin/bookings", color: "from-violet-50 to-purple-50 border-violet-200" },
                    { icon: "💰", title: "Cập nhật giá", desc: "Chỉnh giá ngày thường/cuối tuần", href: "/admin/properties", color: "from-green-50 to-emerald-50 border-green-200" },
                    { icon: "⚙️", title: "Cài đặt", desc: "Cấu hình website", href: "/admin", color: "from-amber-50 to-orange-50 border-amber-200" },
                ].map(a => (
                    <Link key={a.title} href={a.href}
                        className={`bg-gradient-to-br ${a.color} border rounded-2xl p-5 hover:shadow-md transition-all group`}>
                        <span className="text-2xl">{a.icon}</span>
                        <h4 className="font-bold text-gray-900 mt-3 group-hover:text-cyan-700 transition-colors">{a.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
