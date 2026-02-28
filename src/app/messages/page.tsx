"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
    ArrowLeft, MessageSquare,
    Loader2, ExternalLink, HeartHandshake, Facebook
} from "lucide-react";

// ========== 💬 TRANG TRUNG TÂM HỖ TRỢ (TIN NHẮN) ==========
export default function MessagesPage() {
    const router = useRouter();
    const { user, profile, loading } = useAuth();

    // Redirect nếu chưa đăng nhập
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Link liên hệ thực tế
    const ZALO_LINK = "https://zalo.me/0333160365";
    // Link Facebook cá nhân/Fanpage
    const FACEBOOK_LINK = "https://www.facebook.com/MINHPHATVILLA";

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    if (!user) return null;

    const firstName = profile?.name?.split(' ').pop() || "bạn";

    return (
        <main className="min-h-screen flex flex-col bg-gray-50">
            {/* ===== HEADER ===== */}
            <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm z-50 flex-shrink-0 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-semibold text-sm hidden sm:inline">Quay lại</span>
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare size={20} className="text-cyan-600" />
                        Trung tâm hỗ trợ
                    </h1>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#0068FF] flex items-center justify-center shadow-md border-[2px] border-white">
                            <span className="text-white font-extrabold text-sm tracking-wider">MP</span>
                        </div>
                    </Link>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="bg-white max-w-lg w-full rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-blue-50/50 overflow-hidden text-center fade-in slide-in-from-bottom-4 animate-in duration-500">

                    {/* Header Card Pattern */}
                    <div className="h-40 bg-gradient-to-tr from-[#0068FF] to-[#00B2FF] relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:16px_16px]"></div>
                        {/* Avatar nổi */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
                            <div className="w-28 h-28 rounded-full bg-white p-2 shadow-2xl">
                                <div className="w-full h-full rounded-full bg-[#00B2FF] flex items-center justify-center border-4 border-white/50">
                                    <span className="text-white font-black text-[40px] tracking-tight drop-shadow-sm">MP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-10 px-6 sm:px-10">
                        {/* Status badge */}
                        <div className="inline-flex items-center gap-1.5 bg-green-50/80 text-green-600 font-bold px-4 py-1.5 rounded-full text-[13px] mb-5 border border-green-100/50">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            Minh Phát Villa đang hoạt động
                        </div>

                        {/* Welcome text */}
                        <h2 className="text-[28px] font-black text-gray-900 mb-3 tracking-tight">
                            Chào <span className="text-[#00B2FF]">{firstName}</span>!
                        </h2>
                        <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                            Để được hỗ trợ nhanh nhất và nhận hình ảnh/video thực tế về các phòng, vui lòng nhắn tin trực tiếp cho chúng tôi qua Zalo hoặc Messenger nhé.
                        </p>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {/* Zalo Button */}
                            <a
                                href={ZALO_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-3 w-full bg-[#0068FF] hover:bg-[#0055D4] text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {/* Zalo Logo Icon (Custom SVG) */}
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                    <path d="M21.218 10.512C20.672 6.845 16.716 3.75 11.956 3.75C7.26 3.75 3.327 6.786 2.76 10.376C2.26 13.565 4.383 16.633 8.324 18.019L7.49 20.916C7.394 21.258 7.784 21.53 8.083 21.326L11.75 18.823C11.815 18.819 11.886 18.82 11.956 18.82C16.892 18.82 21.755 15.048 21.218 10.512ZM16.591 14.156C16.502 14.249 16.388 14.298 16.273 14.298C16.143 14.298 16.012 14.244 15.92 14.137L13.842 11.666L11.458 14.148C11.272 14.342 10.963 14.332 10.792 14.126L8.4 11.233V13.886C8.4 14.162 8.176 14.386 7.9 14.386C7.624 14.386 7.4 14.162 7.4 13.886V8.986C7.4 8.761 7.545 8.56 7.761 8.495C7.977 8.428 8.214 8.513 8.35 8.707L10.706 11.99L12.981 9.619C13.167 9.426 13.475 9.435 13.647 9.641L16.6 13.186C16.776 13.398 16.772 13.707 16.591 14.156Z" fill="currentColor" />
                                </svg>
                                Chat qua Zalo ngay
                            </a>

                            {/* Facebook Button */}
                            <a
                                href={FACEBOOK_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex items-center justify-center w-full p-[2px] rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
                                <div className="relative flex items-center justify-center gap-3 bg-white w-full py-4 px-6 rounded-[14px]">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-transparent bg-clip-text font-bold text-lg flex items-center gap-2">
                                        <Facebook size={24} className="text-blue-500" />
                                        Truy cập trang Facebook
                                    </div>
                                    <ExternalLink size={16} className="text-gray-400 absolute right-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            </a>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500 max-w-[250px] mx-auto flex flex-col items-center gap-2">
                            <HeartHandshake className="text-cyan-600" size={24} />
                            Minh Phát Villa luôn sẵn sàng đồng hành cùng chuyến đi của bạn.
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
