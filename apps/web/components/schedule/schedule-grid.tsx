"use client";

import { useState } from "react";
import { ScheduleSlot } from "@/lib/schedule"; // We need to export this type properly or redefine
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";

// Re-defining for client usage if import fails (or we should move type to @packages/types completely)
// For now, let's assume the type is compatible
type SlotWithShow = any;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ScheduleGrid({ slots }: { slots: SlotWithShow[] }) {
    const todayIndex = new Date().getDay();
    const [activeDay, setActiveDay] = useState(todayIndex);

    const filteredSlots = slots.filter((slot) => slot.day_of_week === activeDay);

    return (
        <div>
            {/* Day Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
                {DAYS.map((day, index) => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(index)}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                            activeDay === index
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSlots.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed">
                        No shows scheduled for {DAYS[activeDay]}.
                    </div>
                ) : (
                    filteredSlots.map((slot) => (
                        <div
                            key={slot.id}
                            className="group relative overflow-hidden rounded-xl border border-border/50 bg-card hover:border-primary/50 transition-colors"
                        >
                            <div className="aspect-video relative bg-muted">
                                {slot.shows?.cover_image_url ? (
                                    <Image
                                        src={slot.shows.cover_image_url}
                                        alt={slot.shows.title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700 font-display font-bold text-2xl">
                                        PIE RADIO
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="inline-block px-2 py-1 rounded bg-primary text-white text-xs font-bold mb-2">
                                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                    </div>
                                    <h3 className="font-bold text-white text-lg leading-tight">{slot.shows?.title}</h3>
                                    {slot.shows?.genre && (
                                        <p className="text-zinc-300 text-xs mt-1">{slot.shows.genre}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
