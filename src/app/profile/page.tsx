"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, User, Mail, Phone, Shield, Calendar,
    Camera, Check, X, Loader2, Edit3, MapPin,
    CreditCard, Bell, Lock, Gift, Inbox
} from "lucide-react";

// ========== 👤 TRANG HỒ SƠ CÁ NHÂN ==========
export default function ProfilePage() {
    const router = useRouter();
    const { user, profile, loading, updateProfile, signOut } = useAuth();

    // File upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Modal state
    const [activeModal, setActiveModal] = useState<"password" | "offers" | "notifications" | null>(null);
    const [passFormData, setPassFormData] = useState({ newPass: "", confirmPass: "" });
    const [changingPass, setChangingPass] = useState(false);

    // Wishlist state
    const [wishlistCount, setWishlistCount] = useState(0);

    // Redirect nếu chưa đăng nhập
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Lấy số lượng wishlist khi component mount
    useEffect(() => {
        const savedList = JSON.parse(localStorage.getItem('webvilla_wishlist') || '[]');
        setWishlistCount(savedList.length);
    }, []);

    // Cập nhật form khi profile load xong
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phone: profile.phone || "",
            });
        }
    }, [profile]);

    // === Xử lý lưu hồ sơ ===
    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        const { error } = await updateProfile({
            name: formData.name,
            phone: formData.phone,
        });

        if (error) {
            setMessage({ type: "error", text: error });
        } else {
            setMessage({ type: "success", text: "Cập nhật hồ sơ thành công! ✅" });
            setIsEditing(false);
        }
        setSaving(false);

        // Tự động ẩn thông báo sau 3s
        setTimeout(() => setMessage(null), 3000);
    };

    // === Hủy chỉnh sửa ===
    const handleCancel = () => {
        setFormData({
            name: profile?.name || "",
            phone: profile?.phone || "",
        });
        setIsEditing(false);
    };

    // === Xử lý Avatar ===
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX = 400; // Resize to max 400px

                    if (width > height) {
                        if (width > MAX) {
                            height *= MAX / width;
                            width = MAX;
                        }
                    } else {
                        if (height > MAX) {
                            width *= MAX / height;
                            height = MAX;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // Convert to base64 jpeg
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const base64 = await resizeImage(file);
            const { error } = await updateProfile({ avatar: base64 });
            if (error) {
                setMessage({ type: "error", text: "Trích xuất ảnh lỗi: " + error });
            } else {
                setMessage({ type: "success", text: "Cập nhật ảnh đại diện thành công! 📸" });
            }
        } catch {
            setMessage({ type: "error", text: "Lỗi xử lý hình ảnh" });
        }
        setSaving(false);
        setTimeout(() => setMessage(null), 3000);
    };

    // === Xử lý Đổi Mật Khẩu ===
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (passFormData.newPass.length < 6) {
            alert("Mật khẩu phải có ít nhất 6 ký tự!");
            return;
        }
        if (passFormData.newPass !== passFormData.confirmPass) {
            alert("Mật khẩu nhập lại không khớp!");
            return;
        }

        setChangingPass(true);
        const { error } = await supabase.auth.updateUser({ password: passFormData.newPass });
        setChangingPass(false);

        if (error) {
            alert("Lỗi đổi mật khẩu: " + error.message);
        } else {
            setMessage({ type: "success", text: "Đã đổi mật khẩu thành công! 🔐" });
            setActiveModal(null);
            setPassFormData({ newPass: "", confirmPass: "" });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    if (!user || !profile) return null;

    // Lấy 2 chữ cái đầu (Tên lót + Tên chính) cho Avatar
    const getInitials = (name: string) => {
        if (!name) return "MP";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    };
    return (
        <main className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
            {/* ===== HEADER NAV ===== */}
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
                        <Image src="/logo.png" alt="Minh Phát Villa" width={36} height={36} className="rounded-full" />
                        <span className="hidden sm:block text-sm font-bold text-gray-900">Minh Phát Villa</span>
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* ===== THÔNG BÁO ===== */}
                {message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in ${message.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                        }`}>
                        {message.type === "success" ? <Check size={20} /> : <X size={20} />}
                        <span className="font-medium text-sm">{message.text}</span>
                    </div>
                )}

                {/* ===== PROFILE HERO CARD ===== */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                    {/* Banner gradient */}
                    <div className="h-36 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600 relative">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2EpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
                    </div>

                    {/* Avatar + Info */}
                    <div className="px-6 md:px-8 pb-8 -mt-16 relative">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            {/* Avatar lớn */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                    {profile.avatar && (profile.avatar.startsWith("http") || profile.avatar.startsWith("data:")) ? (
                                        <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white text-4xl font-bold tracking-widest">
                                            {getInitials(profile.name)}
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200 z-10"
                                >
                                    <Camera size={16} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Tên + role */}
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                                    {profile.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile.role === "admin"
                                        ? "bg-purple-100 text-purple-700"
                                        : profile.role === "staff"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-green-100 text-green-700"
                                        }`}>
                                        {profile.role === "admin" ? "👑 Quản trị viên"
                                            : profile.role === "staff" ? "💼 Nhân viên"
                                                : "🧳 Khách hàng"}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile.status === "active"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                        }`}>
                                        {profile.status === "active" ? "● Đang hoạt động" : "○ Không hoạt động"}
                                    </span>
                                </div>
                            </div>

                            {/* Nút chỉnh sửa */}
                            <div>
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                    >
                                        <Edit3 size={16} />
                                        Chỉnh sửa hồ sơ
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-200 transition-all"
                                        >
                                            <X size={14} />
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                                        >
                                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                            {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== THÔNG TIN CHI TIẾT ===== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cột trái: Thông tin cá nhân */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User size={20} className="text-cyan-600" />
                                Thông tin cá nhân
                            </h2>

                            <div className="space-y-5">
                                {/* Họ tên */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Họ và tên
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all text-gray-900 font-medium"
                                            placeholder="Nhập họ tên..."
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                            <User size={18} className="text-gray-400" />
                                            <span className="text-gray-900 font-medium">{profile.name || "Chưa cập nhật"}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Email
                                    </label>
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                        <Mail size={18} className="text-gray-400" />
                                        <span className="text-gray-900 font-medium">{profile.email || user?.email}</span>
                                        <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                            ✓ Đã xác thực
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 ml-1">
                                        Email không thể thay đổi
                                    </p>
                                </div>

                                {/* Số điện thoại */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                                        Số điện thoại
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-cyan-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all text-gray-900 font-medium"
                                            placeholder="Nhập số điện thoại..."
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                                            <Phone size={18} className="text-gray-400" />
                                            <span className="text-gray-900 font-medium">{profile.phone || "Chưa cập nhật"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Menu nhanh */}
                    <div className="space-y-6">
                        {/* Thẻ thống kê */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Hoạt động</h3>
                            <div className="space-y-3">
                                <button onClick={() => router.push('/trips')} className="w-full flex items-center justify-between p-3 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors border-2 border-transparent hover:border-cyan-200 text-left cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-cyan-600" />
                                        <span className="text-sm font-bold text-cyan-800">Đơn booking</span>
                                    </div>
                                    <span className="text-lg font-extrabold text-cyan-600">→</span>
                                </button>
                                <button onClick={() => router.push('/wishlist')} className="w-full flex items-center justify-between p-3 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors border-2 border-transparent hover:border-pink-200 text-left cursor-pointer mt-3">
                                    <div className="flex items-center gap-3">
                                        <MapPin size={18} className="text-pink-600" />
                                        <span className="text-sm font-bold text-pink-800">Yêu thích</span>
                                    </div>
                                    <span className="text-lg font-bold text-pink-600">{wishlistCount}</span>
                                </button>
                            </div>
                        </div>

                        {/* Menu tài khoản */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Tài khoản</h3>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setActiveModal("offers")}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <CreditCard size={18} className="text-gray-400" />
                                    <span>Thanh toán & Ưu đãi</span>
                                </button>
                                <button
                                    onClick={() => setActiveModal("notifications")}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <Bell size={18} className="text-gray-400" />
                                    <span>Thông báo</span>
                                </button>
                                <button
                                    onClick={() => setActiveModal("password")}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <Lock size={18} className="text-gray-400" />
                                    <span>Đổi mật khẩu</span>
                                </button>
                                <div className="border-t border-gray-100 my-2" />
                                <button
                                    onClick={async () => { await signOut(); router.push("/"); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
                                >
                                    <span className="text-red-400">🚪</span>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== MODALS ===== */}

            {/* 1. Modal Đổi Mật Khẩu */}
            {activeModal === "password" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white max-w-sm w-full rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Lock className="text-cyan-600" size={24} />
                                Đổi mật khẩu
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    required
                                    value={passFormData.newPass}
                                    onChange={(e) => setPassFormData({ ...passFormData, newPass: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all"
                                    placeholder="Tối thiểu 6 ký tự"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nhập lại mật khẩu mới</label>
                                <input
                                    type="password"
                                    required
                                    value={passFormData.confirmPass}
                                    onChange={(e) => setPassFormData({ ...passFormData, confirmPass: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none transition-all"
                                    placeholder="Nhập lại để xác nhận"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={changingPass}
                                className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {changingPass ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                {changingPass ? "Đang cập nhật..." : "Xác nhận đổi"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. Modal Thanh toán & Ưu đãi */}
            {activeModal === "offers" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white max-w-sm w-full rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 relative overflow-hidden">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-10">
                            <X size={20} />
                        </button>
                        <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <Gift className="text-cyan-500 relative z-10" size={32} />
                            <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20 rounded-full animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thanh toán & Ưu đãi</h3>
                        <p className="text-gray-500 mb-6 font-medium">Bạn chưa có voucher hoặc ưu đãi nào. Hãy đặt phòng thêm để nhận điểm thưởng nhé!</p>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            Khám phá Villa ngay
                        </button>
                    </div>
                </div>
            )}

            {/* 3. Modal Thông báo */}
            {activeModal === "notifications" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white max-w-sm w-full rounded-3xl shadow-2xl p-6 sm:p-8 text-center animate-in zoom-in-95 relative overflow-hidden">
                        <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors z-10">
                            <X size={20} />
                        </button>
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <Inbox className="text-blue-500 relative z-10" size={32} />
                            <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thông báo</h3>
                        <p className="text-gray-500 mb-6 font-medium">Hiện tại bạn không có thông báo mới nào. Mọi cập nhật sẽ hiển thị tại đây.</p>
                        <button
                            onClick={() => setActiveModal(null)}
                            className="w-full bg-blue-50 text-blue-600 py-3.5 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
