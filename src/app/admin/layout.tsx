"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Building2, CalendarCheck, Users,
    ChevronLeft, ChevronRight, LogOut, Bell, Search,
    Menu, X, Settings, Moon, Sun, Home, AlertCircle, Clock, Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Auth Context ──
interface AdminContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (v: boolean) => void;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (v: boolean) => void;
}

const AdminContext = createContext<AdminContextType>({
    isLoggedIn: false,
    setIsLoggedIn: () => { },
    sidebarCollapsed: false,
    setSidebarCollapsed: () => { },
});

export const useAdmin = () => useContext(AdminContext);

// ── Nav items ──
const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Tổng quan", badge: null },
    { href: "/admin/properties", icon: Building2, label: "Quản lý nơi ở", badge: "6" },
    { href: "/admin/bookings", icon: CalendarCheck, label: "Đơn đặt phòng", badge: "3" },
    { href: "/admin/users", icon: Users, label: "Người dùng", badge: null },
];

// ── Login Screen ──
function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
            if (password === adminPassword) {
                onLogin();
            } else {
                setError(true);
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: "radial-gradient(circle at 25% 25%, #06b6d4 1px, transparent 1px), radial-gradient(circle at 75% 75%, #06b6d4 1px, transparent 1px)",
                    backgroundSize: "40px 40px"
                }} />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 mb-4">
                        <span className="text-white font-extrabold text-2xl">MP</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-1">Admin Panel</h1>
                    <p className="text-slate-400">Minh Phát Villa & Homestay</p>
                </div>

                {/* Form */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Mật khẩu quản trị</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                                placeholder="Nhập mật khẩu..."
                                className={`w-full px-5 py-4 rounded-2xl bg-white/10 text-white placeholder-slate-500 font-medium border-2 transition-all focus:outline-none ${error ? "border-red-500 shake" : "border-transparent focus:border-cyan-400"
                                    }`}
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                    ⚠️ Sai mật khẩu, vui lòng thử lại
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg
                                hover:shadow-xl hover:shadow-cyan-500/30 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Đăng nhập"}
                        </button>
                    </form>

                </div>

                {/* Back to site */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors flex items-center justify-center gap-1">
                        <Home size={14} /> Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ── Sidebar ──
function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-40 transition-all duration-300 flex flex-col ${collapsed ? "w-20" : "w-64"
            }`}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-extrabold text-sm">MP</span>
                    </div>
                    {!collapsed && <span className="text-white font-bold text-lg whitespace-nowrap">Admin</span>}
                </div>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative ${active
                                ? "bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-400"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyan-400" />
                            )}
                            <Icon size={20} className={active ? "text-cyan-400" : "text-slate-500 group-hover:text-white"} />
                            {!collapsed && (
                                <span className="font-semibold text-sm flex-1">{item.label}</span>
                            )}
                            {!collapsed && item.badge && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-700 text-slate-400"
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-slate-800">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-white transition-all"
                >
                    <Home size={20} />
                    {!collapsed && <span className="font-semibold text-sm">Về trang chủ</span>}
                </Link>
            </div>
        </aside>
    );
}

// ── Top Bar ──
function TopBar({ onLogout }: { onLogout: () => void }) {
    const pathname = usePathname();
    const router = useRouter();

    // Notifications State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Đóng dropdown khi click ra ngoài
    const notifRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select('*')
                .in('status', ['pending', 'confirmed'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!bookings) return;

            const notifs = [];
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999); // Hết ngày mai

            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);

            for (const b of bookings) {
                // 1. Đơn mới (pending)
                if (b.status === 'pending') {
                    notifs.push({
                        id: `new-${b.id}`,
                        type: 'new_booking',
                        title: 'Đơn đặt phòng mới',
                        message: `${b.guest_name} đặt ${b.property_name} (${new Date(b.check_in).toLocaleDateString('vi-VN')})`,
                        time: new Date(b.created_at),
                        isNew: true,
                        link: '/admin/bookings'
                    });
                }

                // 2. Yêu cầu dời lịch
                if (b.reschedule_requested && b.status === 'confirmed') {
                    notifs.push({
                        id: `reschedule-${b.id}`,
                        type: 'reschedule',
                        title: 'Yêu cầu dời lịch',
                        message: `${b.guest_name} muốn dời lịch ${b.property_name} sang ${new Date(b.new_check_in).toLocaleDateString('vi-VN')}`,
                        time: new Date(b.created_at), // Lấy tạm created_at vì db chưa có tgian update
                        isNew: true,
                        link: '/admin/bookings'
                    });
                }

                // 3. Chuẩn bị Check-in (trong vòng 1 ngày tới)
                if (b.status === 'confirmed') {
                    const checkInDate = new Date(b.check_in);
                    // Nếu Check-in nằm trong khoảng (hiện tại -> cuối ngày mai)
                    if (checkInDate > now && checkInDate <= tomorrow) {
                        const isTomorrow = checkInDate > todayEnd;
                        notifs.push({
                            id: `checkin-${b.id}`,
                            type: 'checkin',
                            title: 'Sắp Check-in',
                            message: `${b.guest_name} sẽ đến ${b.property_name} vào ${isTomorrow ? 'ngày mai' : 'hôm nay'}. Hãy chuẩn bị nhé!`,
                            time: checkInDate,
                            isNew: false, // Thường không phải là sự kiện mới click, mà là nhắc nhở
                            link: '/admin/bookings'
                        });
                    }
                }
            }

            // Sắp xếp: Yêu cầu dời lịch & Đơn mới lên đầu, Nhắc nhở ở dưới
            notifs.sort((a, b) => b.time.getTime() - a.time.getTime());
            setNotifications(notifs);

        } catch (err) {
            console.error("Lỗi fetch thông báo:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling mỗi 1 phút để cập nhật thông báo
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const getTitle = () => {
        if (pathname === "/admin") return "Tổng quan hệ thống";
        if (pathname.includes("properties")) return "Quản lý nơi ở";
        if (pathname.includes("bookings")) return "Đơn đặt phòng";
        if (pathname.includes("users")) return "Quản lý người dùng";
        return "Admin";
    };

    const newCount = notifications.filter(n => n.isNew).length;

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 flex items-center justify-between px-6">
            <div>
                <h1 className="text-xl font-extrabold text-gray-900">{getTitle()}</h1>
            </div>
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5 w-64">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none w-full placeholder-gray-400"
                    />
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        <Bell size={18} className="text-gray-600" />
                        {newCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                                {newCount > 9 ? '9+' : newCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                            <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Thông báo</h3>
                                {newCount > 0 && <span className="text-xs font-bold text-cyan-600 bg-cyan-100 px-2.5 py-1 rounded-full">{newCount} mới</span>}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                    router.push(notif.link);
                                                }}
                                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${notif.isNew ? 'bg-cyan-50/30' : ''}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="mt-1 flex-shrink-0">
                                                        {notif.type === 'new_booking' && <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><AlertCircle size={20} /></div>}
                                                        {notif.type === 'reschedule' && <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Calendar size={20} /></div>}
                                                        {notif.type === 'checkin' && <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Clock size={20} /></div>}
                                                    </div>
                                                    <div>
                                                        <h4 className={`text-sm ${notif.isNew ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{notif.title}</h4>
                                                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                                                        <span className="text-[10px] font-bold text-gray-400 mt-2 block">
                                                            {notif.time.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell size={24} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm font-medium">Chưa có thông báo nào</p>
                                        <p className="text-xs text-gray-400 mt-1">Các thông tin mới sẽ hiển thị tại đây.</p>
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 text-center">
                                    <button
                                        onClick={() => {
                                            setShowNotifications(false);
                                            router.push('/admin/bookings');
                                        }}
                                        className="text-xs font-bold text-cyan-600 hover:text-cyan-800 transition-colors"
                                    >
                                        Xem tất cả đơn đặt phòng
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* User */}
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">AD</span>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-gray-900">Admin</p>
                        <p className="text-xs text-gray-400">Quản trị viên</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-9 h-9 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors group"
                        title="Đăng xuất"
                    >
                        <LogOut size={16} className="text-gray-400 group-hover:text-red-500" />
                    </button>
                </div>
            </div>
        </header>
    );
}

// ── Layout ──
export default function AdminLayout({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (!isLoggedIn) {
        return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
    }

    return (
        <AdminContext.Provider value={{ isLoggedIn, setIsLoggedIn, sidebarCollapsed, setSidebarCollapsed }}>
            <div className="min-h-screen bg-gray-50">
                <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                <div className={`transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-64"}`}>
                    <TopBar onLogout={() => setIsLoggedIn(false)} />
                    <main className="p-6">
                        {children}
                    </main>
                </div>
            </div>
        </AdminContext.Provider>
    );
}
