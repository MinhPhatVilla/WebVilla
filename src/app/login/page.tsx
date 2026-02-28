"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Mail, Lock, Eye, EyeOff, ArrowRight,
    Loader2, X, Home
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
    const router = useRouter();
    const { signIn } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) return setError("Vui lòng nhập email!");
        if (!password) return setError("Vui lòng nhập mật khẩu!");

        setLoading(true);
        const { error: loginError } = await signIn(email, password);
        setLoading(false);

        if (loginError) {
            setError(loginError);
            return;
        }

        // Đăng nhập thành công → về trang chủ
        router.push("/");
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/30">
                        <span className="text-white font-extrabold text-xl">MP</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">Đăng nhập</h1>
                    <p className="text-slate-400 mt-1 text-sm">Minh Phát Villa & Homestay</p>
                </div>

                {/* Form */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="email@gmail.com"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Mật khẩu */}
                        <div>
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">Mật khẩu</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
                                <X size={16} className="text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-300 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Đang đăng nhập...</>
                            ) : (
                                <>Đăng nhập <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 space-y-3">
                        <p className="text-center text-sm text-slate-400">
                            Chưa có tài khoản?{" "}
                            <Link href="/register" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to home */}
                <div className="text-center mt-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
                        <Home size={14} /> Về trang chủ
                    </Link>
                </div>
            </div>
        </main>
    );
}
