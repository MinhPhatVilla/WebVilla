/**
 * 🛡️ P1 SECURITY: Admin Bookings API
 * 
 * Server-side API route cho admin quản lý bookings.
 * - GET: Lấy danh sách bookings (admin only)
 * - PUT: Update booking status (admin only)
 * - DELETE: Xóa booking (admin only)
 * 
 * Tất cả mutations đi qua service_role key (bypass RLS an toàn).
 */
import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ── GET: Lấy bookings (admin only) ──
export async function GET(request: Request) {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── PUT: Update booking (admin only) ──
export async function PUT(request: Request) {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "Thiếu ID booking" }, { status: 400 });
        }

        // Validate status nếu có
        const validStatuses = ["pending", "confirmed", "checked_in", "completed", "cancelled"];
        if (updates.status && !validStatuses.includes(updates.status)) {
            return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
        }

        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from("bookings")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── DELETE: Xóa booking (admin only) ──
export async function DELETE(request: Request) {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Thiếu ID booking" }, { status: 400 });
        }

        const supabase = getAdminClient();
        const { error } = await supabase
            .from("bookings")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
