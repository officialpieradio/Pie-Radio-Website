"use client";

import { useAudio } from "@/context/audio-context";
import { useCurrentShow } from "@/hooks/use-current-show";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Loader2, Music2, Radio } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function PersistentPlayer() {
    const { isPlaying, togglePlay, currentTrack, isLoading } = useAudio();
    const { currentShow } = useCurrentShow();

    // If no track info (shouldn't happen with default), fallbacks
    // If we have a current Show but no specific "Song" metadata (or it's just "Pie Radio"), prioritize Show info?
    // Strategy: Always show Metadata if available, otherwise Show info.

    const title = (currentTrack?.title === "Pie Radio Live" && currentShow?.shows?.title)
        ? currentShow.shows.title
        : (currentTrack?.title || "Pie Radio");

    const artist = (currentTrack?.artist === "The Number One Station" && currentShow?.shows?.host_id)
        ? `Hosted by ${currentShow.shows.host_id}`
        : (currentTrack?.artist || "Live Stream");
    const artwork = currentShow?.shows?.cover_image_url || currentTrack?.artwork || "";

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-2xl">
            <div className="container mx-auto flex max-w-screen-2xl items-center justify-between">

                {/* Track Info */}
                <div className="flex items-center gap-4 w-1/3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                        {artwork && artwork !== "/placeholder-cover.jpg" ? (
                            <Image src={artwork} alt={title} fill className="object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <Music2 className="h-6 w-6" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-semibold">{title}</span>
                        <span className="truncate text-xs text-muted-foreground">{artist}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 w-1/3">
                    <Button
                        size="icon"
                        variant="default"
                        className="h-12 w-12 rounded-full shadow-lg"
                        onClick={togglePlay}
                    >
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="h-6 w-6 fill-current" />
                        ) : (
                            <Play className="h-6 w-6 fill-current ml-1" />
                        )}
                        <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                    </Button>
                </div>

                {/* Volume / Extra */}
                <div className="flex items-center justify-end gap-2 w-1/3">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                    {/* Volume Slider Placeholder */}
                    <div className="h-1 w-24 rounded-full bg-secondary">
                        <div className="h-full w-2/3 rounded-full bg-primary/50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
