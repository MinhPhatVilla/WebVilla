/**
 * 🛡️ P1 SECURITY: Admin Properties API
 * 
 * Server-side API route cho admin quản lý properties.
 * - GET: Lấy danh sách (admin only)
 * - POST: Tạo mới (admin only)
 * - PUT: Cập nhật (admin only)
 * - DELETE: Xóa (admin only)
 */
import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import { sanitizeVietnamese } from "@/lib/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getAdminClient() {
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

// ── GET: Lấy properties ──
export async function GET(request: Request) {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from("properties")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json({ data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── POST: Tạo property mới ──
export async function POST(request: Request) {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.type) {
            return NextResponse.json(
                { error: "Thiếu tên hoặc loại nơi ở" },
                { status: 400 }
            );
        }

        if (!["villa", "homestay"].includes(body.type)) {
            return NextResponse.json(
                { error: "Loại nơi ở phải là 'villa' hoặc 'homestay'" },
                { status: 400 }
            );
        }

        // Sanitize text fields
        const sanitizedData = {
            ...body,
            name: sanitizeVietnamese(body.name),
            description: sanitizeVietnamese(body.description || ""),
            long_description: sanitizeVietnamese(body.long_description || ""),
            location: sanitizeVietnamese(body.location || ""),
            address: sanitizeVietnamese(body.address || ""),
        };

        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from("properties")
            .insert(sanitizedData)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ data }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ── PUT: Cập nhật property ──
export async function PUT(request: Request) {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "Thiếu ID property" }, { status: 400 });
        }

        // Sanitize text fields nếu có
        if (updates.name) updates.name = sanitizeVietnamese(updates.name);
        if (updates.description) updates.description = sanitizeVietnamese(updates.description);
        if (updates.long_description) updates.long_description = sanitizeVietnamese(updates.long_description);
        if (updates.location) updates.location = sanitizeVietnamese(updates.location);
        if (updates.address) updates.address = sanitizeVietnamese(updates.address);

        const supabase = getAdminClient();
        const { data, error } = await supabase
            .from("properties")
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

// ── DELETE: Xóa property ──
export async function DELETE(request: Request) {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Thiếu ID property" }, { status: 400 });
        }

        const supabase = getAdminClient();
        const { error } = await supabase
            .from("properties")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
