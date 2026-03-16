"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { UserCircle, LogOut, ChevronDown, Heart, Luggage, MessageSquare, LogIn } from "lucide-react";

interface UserMenuProps {
    user: User | null;
    profileName?: string;
    onSignOut: () => Promise<void>;
}

export default function UserMenu({ user, profileName, onSignOut }: UserMenuProps) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 p-2 md:px-3 md:py-2 rounded-full transition-all"
                aria-label="Menu tài khoản"
            >
                {user ? (
                    <>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                {(profileName || user.email || '?').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                            {profileName || user.email?.split('@')[0]}
                        </span>
                    </>
                ) : (
                    <>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <UserCircle size={16} className="text-white" />
                        </div>
                        <span className="hidden md:block text-sm font-semibold text-gray-700">Tài khoản</span>
                    </>
                )}
                <ChevronDown size={14} className={`hidden md:block text-gray-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 py-2 w-56 z-50 animate-in fade-in slide-in-from-top-2">
                        {user ? (
                            <>
                                <div className="py-1">
                                    <button
                                        onClick={() => { router.push('/messages'); setShowMenu(false); }}
                                        className="w-full px-5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3.5 transition-colors font-medium"
                                    >
                                        <MessageSquare size={18} className="text-gray-400" />
                                        <span>Tin nhắn</span>
                                    </button>
                                    <button
                                        onClick={() => { router.push('/trips'); setShowMenu(false); }}
                                        className="w-full px-5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3.5 transition-colors font-medium"
                                    >
                                        <Luggage size={18} className="text-gray-400" />
                                        <span>Đơn booking</span>
                                    </button>
                                    <button
                                        onClick={() => { router.push('/profile'); setShowMenu(false); }}
                                        className="w-full px-5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3.5 transition-colors font-medium"
                                    >
                                        <UserCircle size={18} className="text-gray-400" />
                                        <span>Hồ sơ</span>
                                    </button>
                                </div>
                                <div className="border-t border-gray-100 my-1" />
                                <div className="py-1">
                                    <button
                                        onClick={async () => { await onSignOut(); setShowMenu(false); }}
                                        className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 font-bold transition-colors"
                                    >
                                        <LogOut size={18} className="text-gray-400" />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="py-1">
                                <button
                                    onClick={() => { router.push('/login'); setShowMenu(false); }}
                                    className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 font-bold transition-colors"
                                >
                                    <LogIn size={18} className="text-gray-400" />
                                    <span>Đăng nhập</span>
                                </button>
                                <button
                                    onClick={() => { router.push('/register'); setShowMenu(false); }}
                                    className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 font-bold transition-colors"
                                >
                                    <UserCircle size={18} className="text-cyan-500" />
                                    <span>Đăng ký</span>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
