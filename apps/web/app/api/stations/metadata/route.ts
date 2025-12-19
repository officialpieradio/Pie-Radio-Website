import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const supabase = await createClient();

    // 1. Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Role (Optional but recommended)
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    // if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
        const body = await request.json();
        const { title, artist, cover_url } = body;

        if (!title || !artist) {
            return NextResponse.json({ error: "Missing title or artist" }, { status: 400 });
        }

        // 2. Update Current Metadata (ID=1)
        const { error: updateError } = await supabase
            .from('station_metadata')
            .update({
                title,
                artist,
                cover_url,
                updated_at: new Date().toISOString()
            } as any)
            .eq('id', 1);

        if (updateError) throw updateError;

        // 3. Log History
        const { error: historyError } = await supabase
            .from('station_metadata_history')
            .insert({
                metadata_id: 1,
                title,
                artist,
                cover_url
            });

        if (historyError) {
            console.error("Failed to save history:", historyError);
            // Don't fail the request just because history failed, but log it.
        }

        return NextResponse.json({ success: true, message: "Metadata updated" });

    } catch (err: any) {
        console.error("Metadata API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
