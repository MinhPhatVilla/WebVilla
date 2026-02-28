"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Mail, Lock, User, Phone, Eye, EyeOff,
    ArrowRight, Check, X, Shield, Loader2,
    KeyRound, ArrowLeft, RefreshCw, Sparkles
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// ── Kiểm tra độ mạnh mật khẩu ──
function getPasswordStrength(pw: string) {
    const checks = [
        { label: "Ít nhất 8 ký tự", ok: pw.length >= 8 },
        { label: "Chữ hoa (A-Z)", ok: /[A-Z]/.test(pw) },
        { label: "Chữ thường (a-z)", ok: /[a-z]/.test(pw) },
        { label: "Số (0-9)", ok: /[0-9]/.test(pw) },
        { label: "Ký tự đặc biệt (!@#$...)", ok: /[^A-Za-z0-9]/.test(pw) },
    ];
    const score = checks.filter(c => c.ok).length;
    const levels = ["", "Yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
    const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];
    return { checks, score, level: levels[score], color: colors[score] };
}

// ── Component OTP Input (1 ô nhập mã) ──
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="relative">
            <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" />
            <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={value}
                onChange={e => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                    onChange(clean);
                }}
                placeholder="Nhập mã OTP từ email"
                autoComplete="off"
                autoFocus
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-white/20 bg-white/10 text-white text-center text-2xl font-extrabold tracking-[0.5em] placeholder:text-slate-500 placeholder:text-sm placeholder:tracking-normal placeholder:font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
            />
        </div>
    );
}

export default function RegisterPage() {
    const router = useRouter();
    const { signUp, verifyOtp, resendOtp } = useAuth();

    // ── State ──
    const [step, setStep] = useState<"form" | "otp">("form");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // OTP state
    const [otpCode, setOtpCode] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setInterval(() => setResendCooldown(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [resendCooldown]);

    const pw = getPasswordStrength(password);

    // ── Bước 1: Đăng ký ──
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) return setError("Vui lòng nhập họ tên!");
        if (!phone.trim()) return setError("Vui lòng nhập số điện thoại!");
        if (!email.trim()) return setError("Vui lòng nhập email!");
        if (pw.score < 3) return setError("Mật khẩu chưa đủ mạnh! Cần ít nhất mức Trung bình.");

        setLoading(true);
        const { error: signUpError } = await signUp(email, password, { name: name.trim(), phone: phone.trim() });
        setLoading(false);

        if (signUpError) {
            setError(signUpError);
            return;
        }

        // Chuyển sang bước nhập OTP
        setStep("otp");
        setResendCooldown(60);
    };

    // ── Bước 2: Xác thực OTP ──
    const handleVerifyOtp = async () => {
        if (otpCode.length < 6) {
            setOtpError("Vui lòng nhập mã OTP từ email!");
            return;
        }

        setOtpLoading(true);
        setOtpError("");
        const { error: verifyError } = await verifyOtp(email, otpCode);
        setOtpLoading(false);

        if (verifyError) {
            setOtpError(verifyError);
            return;
        }

        // Thành công → chuyển về trang chủ
        router.push("/");
    };

    // ── Gửi lại OTP ──
    const handleResend = async () => {
        if (resendCooldown > 0) return;
        const { error } = await resendOtp(email);
        if (error) {
            setOtpError(error);
        } else {
            setOtpError("");
            setResendCooldown(60);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-cyan-500/30">
                        <span className="text-white font-extrabold text-xl">MP</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white">
                        {step === "form" ? "Tạo tài khoản mới" : "Xác thực Email"}
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm">
                        {step === "form" ? "Minh Phát Villa & Homestay" : `Mã OTP đã gửi đến ${email}`}
                    </p>
                </div>

                {/* ═══════════ STEP 1: Registration Form ═══════════ */}
                {step === "form" && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Họ tên */}
                            <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">Họ và tên *</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">Số điện thoại *</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="0901234567"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">Email *</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="email@gmail.com"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Mật khẩu */}
                            <div>
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">Mật khẩu *</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Strength bar */}
                                {password && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= pw.score ? pw.color : "bg-transparent"}`} />
                                                ))}
                                            </div>
                                            <span className={`text-xs font-bold ${pw.score >= 4 ? "text-green-400" : pw.score >= 3 ? "text-yellow-400" : "text-red-400"}`}>
                                                {pw.level}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {pw.checks.map(c => (
                                                <div key={c.label} className="flex items-center gap-1.5 text-xs">
                                                    {c.ok ? <Check size={12} className="text-green-400" /> : <X size={12} className="text-slate-500" />}
                                                    <span className={c.ok ? "text-green-300" : "text-slate-500"}>{c.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                    <><Loader2 size={18} className="animate-spin" /> Đang tạo tài khoản...</>
                                ) : (
                                    <>Đăng ký <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>

                        {/* Link đăng nhập */}
                        <p className="text-center text-sm text-slate-400 mt-6">
                            Đã có tài khoản?{" "}
                            <Link href="/login" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                )}

                {/* ═══════════ STEP 2: OTP Verification ═══════════ */}
                {step === "otp" && (
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30 flex items-center justify-center">
                                <KeyRound size={32} className="text-cyan-400" />
                            </div>
                        </div>

                        <p className="text-center text-sm text-slate-300 mb-6">
                            Nhập mã <strong className="text-cyan-400">OTP</strong> đã gửi đến
                            <br /><strong className="text-white">{email}</strong>
                        </p>

                        {/* OTP Input */}
                        <div className="mb-6">
                            <OtpInput value={otpCode} onChange={setOtpCode} />
                        </div>

                        {/* Error */}
                        {otpError && (
                            <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
                                <X size={16} className="text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-300 font-medium">{otpError}</p>
                            </div>
                        )}

                        {/* Verify button */}
                        <button
                            onClick={handleVerifyOtp}
                            disabled={otpLoading || otpCode.length < 6}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base shadow-xl shadow-green-500/30 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {otpLoading ? (
                                <><Loader2 size={18} className="animate-spin" /> Đang xác thực...</>
                            ) : (
                                <><Shield size={18} /> Xác thực</>
                            )}
                        </button>

                        {/* Resend */}
                        <div className="flex items-center justify-center gap-2 mt-5">
                            <span className="text-sm text-slate-400">Không nhận được?</span>
                            <button
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors disabled:text-slate-500 flex items-center gap-1"
                            >
                                <RefreshCw size={14} />
                                {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : "Gửi lại"}
                            </button>
                        </div>

                        {/* Back */}
                        <button
                            onClick={() => { setStep("form"); setOtpCode(""); setOtpError(""); }}
                            className="w-full mt-4 py-3 rounded-2xl bg-white/5 text-slate-400 font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
                        >
                            <ArrowLeft size={16} /> Quay lại
                        </button>
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    Bằng việc đăng ký, bạn đồng ý với{" "}
                    <span className="text-slate-400">Điều khoản dịch vụ</span> của Minh Phát Villa
                </p>
            </div>
        </main>
    );
}
