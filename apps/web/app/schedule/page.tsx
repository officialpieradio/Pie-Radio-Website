import { createClient } from "@/lib/supabase/server";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";

export const revalidate = 60; // Revalidate every minute

export default async function SchedulePage() {
    const supabase = await createClient();

    const { data: slots, error } = await supabase
        .from("schedule_slots")
        .select(`
      *,
      shows (*)
    `)
        .order("day_of_week")
        .order("start_time");

    if (error) {
        console.error("Error fetching schedule", error);
        return <div>Error loading schedule.</div>;
    }

    return (
        <div className="container py-12 px-4 md:px-8 max-w-screen-2xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-display tracking-tight mb-2">Schedule</h1>
                <p className="text-muted-foreground">Find out when your favorite shows are airing.</p>
            </div>

            <ScheduleGrid slots={slots || []} />
        </div>
    );
}
