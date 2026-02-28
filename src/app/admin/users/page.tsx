"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    Search, X, Eye, Edit2, Trash2, Shield, ShieldCheck, ShieldAlert,
    Phone, Mail, Calendar, MoreHorizontal, UserPlus, Filter,
    Crown, User, UserCog, Check, Ban, MessageCircle, Loader2, RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Interface UserData ──
interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    role: "admin" | "staff" | "customer";
    status: "active" | "inactive" | "banned";
    bookings: number;
    totalSpent: number;
    joinedAt: string;
    lastActive: string;
}

// ── Helper: chuyển dữ liệu DB → UserData ──
function rowToUser(row: Record<string, unknown>): UserData {
    return {
        id: (row.id as string) || "",
        name: (row.name as string) || "",
        email: (row.email as string) || "",
        phone: (row.phone as string) || "",
        avatar: (row.avatar as string) || "",
        role: (row.role as UserData["role"]) || "customer",
        status: (row.status as UserData["status"]) || "active",
        bookings: (row.bookings_count as number) || 0,
        totalSpent: Number(row.total_spent) || 0,
        joinedAt: (row.joined_at as string) || "",
        lastActive: (row.last_active as string) || "",
    };
}

const roleConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    admin: { label: "Admin", cls: "bg-red-100 text-red-700", icon: <Crown size={12} /> },
    staff: { label: "Nhân viên", cls: "bg-blue-100 text-blue-700", icon: <UserCog size={12} /> },
    customer: { label: "Khách hàng", cls: "bg-gray-100 text-gray-700", icon: <User size={12} /> },
};

const statusBadge: Record<string, { label: string; cls: string }> = {
    active: { label: "Hoạt động", cls: "bg-green-100 text-green-700" },
    inactive: { label: "Không HĐ", cls: "bg-gray-100 text-gray-500" },
    banned: { label: "Đã chặn", cls: "bg-red-100 text-red-700" },
};

const avatarColors = [
    "from-cyan-400 to-blue-500",
    "from-violet-400 to-purple-500",
    "from-amber-400 to-orange-500",
    "from-green-400 to-emerald-500",
    "from-rose-400 to-pink-500",
    "from-indigo-400 to-blue-600",
    "from-teal-400 to-cyan-500",
    "from-yellow-400 to-orange-500",
    "from-fuchsia-400 to-pink-500",
    "from-lime-400 to-green-500",
];

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    // ── Lấy dữ liệu users từ Supabase ──
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .order("joined_at", { ascending: true });

            if (error) throw error;
            setUsers((data || []).map(rowToUser));
        } catch (err) {
            console.error("Lỗi khi tải users:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ── Cập nhật trạng thái user ──
    const updateUserStatus = async (userId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("users")
                .update({ status: newStatus })
                .eq("id", userId);

            if (error) throw error;

            setUsers(prev =>
                prev.map(u => u.id === userId ? { ...u, status: newStatus as UserData["status"] } : u)
            );
            setSelectedUser(null);
            alert(newStatus === "banned" ? "🚫 Đã chặn người dùng!" : "✅ Đã cập nhật trạng thái!");
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái:", err);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const fmtPrice = (n: number) => n.toLocaleString("vi-VN");
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.phone.includes(searchTerm);
            const matchRole = filterRole === "all" || u.role === filterRole;
            return matchSearch && matchRole;
        });
    }, [users, searchTerm, filterRole]);

    // Thống kê
    const totalCustomers = users.filter(u => u.role === "customer").length;
    const activeCount = users.filter(u => u.status === "active").length;
    const staffCount = users.filter(u => u.role === "staff" || u.role === "admin").length;
    const topSpender = users.length > 0
        ? [...users].sort((a, b) => b.totalSpent - a.totalSpent)[0]
        : null;

    // ── Loading state ──
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                <span className="ml-3 text-gray-500 font-medium">Đang tải danh sách người dùng...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><User size={18} className="text-blue-600" /></div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{users.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Tổng người dùng</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><ShieldCheck size={18} className="text-green-600" /></div>
                    </div>
                    <p className="text-2xl font-extrabold text-green-600">{activeCount}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Đang hoạt động</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><UserCog size={18} className="text-violet-600" /></div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{staffCount}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Admin & Nhân viên</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Crown size={18} className="text-amber-600" /></div>
                    </div>
                    <div>
                        <p className="text-lg font-extrabold text-gray-900">{topSpender?.name || "—"}</p>
                        <p className="text-xs text-gray-500">Top chi tiêu · {topSpender ? `${fmtPrice(topSpender.totalSpent)}đ` : "—"}</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email, SĐT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none w-full placeholder-gray-400"
                    />
                    {searchTerm && (<button onClick={() => setSearchTerm("")}><X size={14} className="text-gray-400" /></button>)}
                </div>

                <div className="flex items-center gap-2">
                    {[
                        { key: "all", label: "Tất cả" },
                        { key: "admin", label: "Admin" },
                        { key: "staff", label: "Nhân viên" },
                        { key: "customer", label: "Khách hàng" },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilterRole(f.key)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterRole === f.key ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Nút làm mới */}
                <button
                    onClick={fetchUsers}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                    title="Làm mới dữ liệu"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                {["Người dùng", "Vai trò", "Trạng thái", "Đơn đặt", "Chi tiêu", "Ngày tham gia", ""].map(h => (
                                    <th key={h} className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12">
                                        <span className="text-4xl">👤</span>
                                        <p className="font-bold text-gray-700 mt-3">Không tìm thấy người dùng</p>
                                    </td>
                                </tr>
                            ) : filtered.map((u, idx) => (
                                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setSelectedUser(u)}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                                                {u.avatar}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                                <p className="text-xs text-gray-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${roleConfig[u.role]?.cls || ""}`}>
                                            {roleConfig[u.role]?.icon} {roleConfig[u.role]?.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[u.status]?.cls || ""}`}>
                                            {statusBadge[u.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-semibold text-gray-700">{u.bookings}</td>
                                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{u.totalSpent > 0 ? `${fmtPrice(u.totalSpent)}đ` : "—"}</td>
                                    <td className="px-5 py-4 text-sm text-gray-500">{fmtDate(u.joinedAt)}</td>
                                    <td className="px-5 py-4">
                                        <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                                            <Eye size={16} className="text-gray-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Top section */}
                        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-3xl p-6 pb-8 text-center">
                            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 text-white">
                                <X size={16} />
                            </button>
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColors[users.indexOf(selectedUser) % avatarColors.length]} flex items-center justify-center text-white font-bold text-xl mx-auto mb-3 shadow-xl`}>
                                {selectedUser.avatar}
                            </div>
                            <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mt-2 ${roleConfig[selectedUser.role]?.cls || ""}`}>
                                {roleConfig[selectedUser.role]?.icon} {roleConfig[selectedUser.role]?.label}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Mail size={12} /> Email</div>
                                    <p className="text-sm font-bold text-gray-900 truncate">{selectedUser.email}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Phone size={12} /> Điện thoại</div>
                                    <p className="text-sm font-bold text-gray-900">{selectedUser.phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-cyan-50 rounded-xl p-3 text-center">
                                    <p className="text-xl font-extrabold text-cyan-700">{selectedUser.bookings}</p>
                                    <p className="text-[10px] text-gray-500 font-bold">Đơn đặt</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-3 text-center">
                                    <p className="text-sm font-extrabold text-green-700">{selectedUser.totalSpent > 0 ? `${fmtPrice(selectedUser.totalSpent)}đ` : "—"}</p>
                                    <p className="text-[10px] text-gray-500 font-bold">Chi tiêu</p>
                                </div>
                                <div className={`rounded-xl p-3 text-center ${statusBadge[selectedUser.status]?.cls.includes("green") ? "bg-green-50" : "bg-gray-50"}`}>
                                    <p className="text-sm font-extrabold">{statusBadge[selectedUser.status]?.label}</p>
                                    <p className="text-[10px] text-gray-500 font-bold">Trạng thái</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                                <span className="flex items-center gap-1"><Calendar size={12} /> Tham gia: {fmtDate(selectedUser.joinedAt)}</span>
                                <span>Online cuối: {fmtDate(selectedUser.lastActive)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <a href={`tel:${selectedUser.phone}`} className="flex-1 py-2.5 rounded-xl bg-green-100 text-green-700 font-bold text-sm text-center hover:bg-green-200 transition-all flex items-center justify-center gap-1.5">
                                    <Phone size={14} /> Gọi
                                </a>
                                <a href={`https://zalo.me/${selectedUser.phone}`} target="_blank" className="flex-1 py-2.5 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm text-center hover:bg-blue-200 transition-all flex items-center justify-center gap-1.5">
                                    <MessageCircle size={14} /> Zalo
                                </a>
                                {selectedUser.role === "customer" && selectedUser.status === "active" && (
                                    <button
                                        onClick={() => updateUserStatus(selectedUser.id, "banned")}
                                        className="py-2.5 px-4 rounded-xl bg-red-100 text-red-600 font-bold text-sm hover:bg-red-200 transition-all flex items-center gap-1.5"
                                    >
                                        <Ban size={14} /> Chặn
                                    </button>
                                )}
                                {selectedUser.role === "customer" && selectedUser.status === "banned" && (
                                    <button
                                        onClick={() => updateUserStatus(selectedUser.id, "active")}
                                        className="py-2.5 px-4 rounded-xl bg-green-100 text-green-600 font-bold text-sm hover:bg-green-200 transition-all flex items-center gap-1.5"
                                    >
                                        <Check size={14} /> Bỏ chặn
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
