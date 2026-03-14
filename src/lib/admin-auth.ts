/**
 * 🛡️ P1 SECURITY: Admin Auth Helper
 * 
 * Xác thực admin qua Supabase Auth token trong request header.
 * Dùng chung cho tất cả admin API routes.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Xác thực request từ admin — kiểm tra JWT token + role
 * @returns { authenticated: boolean, userId?: string, error?: string }
 */
export async function authenticateAdmin(request: Request): Promise<{
    authenticated: boolean;
    userId?: string;
    error?: string;
}> {
    try {
        // 1. Lấy token từ header
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { authenticated: false, error: "Thiếu token xác thực" };
        }

        const token = authHeader.replace("Bearer ", "");

        // 2. Verify token bằng Supabase
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return { authenticated: false, error: "Token không hợp lệ hoặc đã hết hạn" };
        }

        // 3. Kiểm tra role admin trong database
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", user.id)
            .single();

        if (userError || !userData || userData.role !== "admin") {
            return { authenticated: false, error: "Không có quyền quản trị viên" };
        }

        return { authenticated: true, userId: user.id };
    } catch (err) {
        return { authenticated: false, error: "Lỗi xác thực" };
    }
}
