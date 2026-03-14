/**
 * 🔐 Supabase Admin Client — Server-side ONLY
 * 
 * Dùng service_role key để bypass RLS.
 * CHỈ DÙNG trong API Routes (server-side), KHÔNG BAO GIỜ import ở client.
 * 
 * Khi nào dùng:
 * - Admin mutations (CRUD properties, bookings, users)
 * - Server-side data operations cần toàn quyền
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
    console.warn(
        "⚠️ SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình! " +
        "Admin API routes sẽ không hoạt động."
    );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || "missing-key", {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
