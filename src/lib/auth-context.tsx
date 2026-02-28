"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// ── Interface ──
interface PublicProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    avatar: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: PublicProfile | null;
    loading: boolean;
    signUp: (email: string, password: string, meta: { name: string; phone: string }) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
    resendOtp: (email: string) => Promise<{ error: string | null }>;
    updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // ── Lấy profile từ bảng public.users ──
    const fetchProfile = useCallback(async (authId: string) => {
        try {
            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("auth_id", authId)
                .single();

            if (data) {
                setProfile({
                    id: data.id,
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    role: data.role || "customer",
                    status: data.status || "active",
                    avatar: data.avatar || "",
                });
            }
        } catch (err) {
            console.error("Lỗi fetch profile:", err);
        }
    }, []);

    // ── Khởi tạo session + lắng nghe thay đổi ──
    useEffect(() => {
        // Lấy session hiện tại
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        // Lắng nghe auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    // ── Đăng ký ──
    const signUp = async (email: string, password: string, meta: { name: string; phone: string }) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: meta.name,
                    phone: meta.phone,
                },
            },
        });

        if (error) {
            // Dịch lỗi sang tiếng Việt
            if (error.message.includes("already registered")) {
                return { error: "Email này đã được đăng ký. Vui lòng đăng nhập!" };
            }
            if (error.message.includes("valid email")) {
                return { error: "Email không hợp lệ!" };
            }
            if (error.message.includes("at least")) {
                return { error: "Mật khẩu phải có ít nhất 6 ký tự!" };
            }
            return { error: error.message };
        }

        return { error: null };
    };

    // ── Đăng nhập ──
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.includes("Invalid login")) {
                return { error: "Email hoặc mật khẩu không đúng!" };
            }
            if (error.message.includes("Email not confirmed")) {
                return { error: "Email chưa được xác thực. Vui lòng kiểm tra hộp thư!" };
            }
            return { error: error.message };
        }

        return { error: null };
    };

    // ── Đăng xuất ──
    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };

    // ── Xác thực OTP ──
    const verifyOtp = async (email: string, token: string) => {
        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: "signup",
        });

        if (error) {
            if (error.message.includes("expired")) {
                return { error: "Mã OTP đã hết hạn. Vui lòng gửi lại!" };
            }
            if (error.message.includes("invalid")) {
                return { error: "Mã OTP không đúng. Vui lòng kiểm tra lại!" };
            }
            return { error: error.message };
        }

        return { error: null };
    };

    // ── Gửi lại OTP ──
    const resendOtp = async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: "signup",
            email,
        });

        if (error) {
            if (error.message.includes("rate")) {
                return { error: "Vui lòng đợi 60 giây trước khi gửi lại!" };
            }
            return { error: error.message };
        }

        return { error: null };
    };

    // ── Cập nhật hồ sơ cá nhân ──
    const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
        if (!user) return { error: "Chưa đăng nhập!" };

        try {
            const { error } = await supabase
                .from("users")
                .update({
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.phone !== undefined && { phone: data.phone }),
                    ...(data.avatar !== undefined && { avatar: data.avatar }),
                })
                .eq("auth_id", user.id);

            if (error) {
                return { error: "Không thể cập nhật hồ sơ. Vui lòng thử lại!" };
            }

            // Cập nhật profile local
            await fetchProfile(user.id);
            return { error: null };
        } catch {
            return { error: "Đã xảy ra lỗi. Vui lòng thử lại!" };
        }
    };

    return (
        <AuthContext.Provider value={{
            session, user, profile, loading,
            signUp, signIn, signOut, verifyOtp, resendOtp, updateProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Hook sử dụng auth ──
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth phải nằm trong <AuthProvider>");
    return ctx;
}
