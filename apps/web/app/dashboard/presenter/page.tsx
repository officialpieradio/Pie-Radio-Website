"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Radio } from "lucide-react";

export default function PresenterDashboard() {
    const { user, profile } = useAuth();
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Check if current user is live
        // Real implementation would look up schedule or station_metadata
        // For MVP we just use local state or a simple db flag if we had one.
        // Let's assume we check the 'shows' table if they have an active slot?
        // Or we add a `is_live` column to profiles?
        // Let's stick to the plan: "Manual Override -> Updates station_metadata".
        setLoading(false);
    }, []);

    const toggleLiveStatus = async () => {
        // Implementation: Update a 'station_status' table or similar.
        // For now, let's just mock it to show UI state.
        setIsLive(!isLive);
    };

    if (!profile || profile.role !== "presenter" && profile.role !== "admin") {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p>You must be a presenter to view this page.</p>
            </div>
        );
    }

    return (
        <div className="container py-12 px-4 md:px-8 max-w-screen-xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">Presenter Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {profile.username || user?.email}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isLive ? "bg-red-500/10 border-red-500/50 text-red-500" : "bg-zinc-100 border-zinc-200 text-zinc-500"}`}>
                        <div className={`w-3 h-3 rounded-full ${isLive ? "bg-red-500 animate-pulse" : "bg-zinc-400"}`} />
                        <span className="font-bold text-sm uppercase tracking-wider">{isLive ? "ON AIR" : "OFF AIR"}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Control Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Radio className="w-5 h-5" />
                            Broadcast Controls
                        </h2>
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
                            <div>
                                <h3 className="font-medium">Live Status Override</h3>
                                <p className="text-sm text-muted-foreground">Manually take control of the stream branding.</p>
                            </div>
                            <Button
                                variant={isLive ? "destructive" : "default"}
                                onClick={toggleLiveStatus}
                                className="w-32"
                            >
                                {isLive ? "Go Offline" : "Go Live"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">Log Request</Button>
                            <Button variant="outline" className="w-full justify-start">Check Schedule</Button>
                            <Button variant="outline" className="w-full justify-start">Upload Show</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
