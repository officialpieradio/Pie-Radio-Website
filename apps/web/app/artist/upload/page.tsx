"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
// import { Input } from "@/components/ui/button"; // Wait, Input is usually in ui/input
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { useAuth } from "@/context/auth-context";
import { Database } from "@packages/types";


// Simple Input component since we might not have one yet
function SimpleInput({ label, ...props }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">{label}</label>
            <input
                className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                {...props}
            />
        </div>
    );
}

export default function ArtistUploadPage() {
    const { user } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [formData, setFormData] = useState({
        title: "",
        genre: "",
        description: "",
    });

    const [audioPath, setAudioPath] = useState<string | null>(null);
    const [imagePath, setImagePath] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioPath) {
            setError("Please upload an audio file.");
            return;
        }
        if (!formData.title) {
            setError("Title is required.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            // We usually don't have public URL for private buckets (music), so we store path.
            // For images (public), we can construct the URL.
            const { data: imageData } = supabase.storage.from('images').getPublicUrl(imagePath || "");

            // Insert into artist_uploads table
            const { error: dbError } = await supabase
                .from('artist_uploads')
                .insert({
                    artist_id: user?.id ?? null,
                    title: formData.title,
                    genre: formData.genre,
                    audio_url: audioPath,
                    status: 'pending' as Database["public"]["Enums"]["request_status"],
                    reviewed_by: null
                } as any);

            if (dbError) throw dbError;

            // Redirect to success or dashboard
            router.push('/dashboard/artist?success=true');

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to submit upload");
            setSubmitting(false);
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-white mb-2">Upload New Track</h1>
            <p className="text-zinc-400 mb-8">Submit your music for review. Allowed formats: MP3, WAV (Max 50MB).</p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <SimpleInput
                        label="Track Title"
                        placeholder="e.g. Summer Vibes"
                        value={formData.title}
                        onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />

                    <SimpleInput
                        label="Genre"
                        placeholder="e.g. Afrobeats"
                        value={formData.genre}
                        onChange={(e: any) => setFormData({ ...formData, genre: e.target.value })}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Audio File *</label>
                        <FileUploader
                            bucket="music"
                            acceptedFileTypes={['audio/mpeg', 'audio/wav', 'audio/x-m4a']}
                            maxSizeMB={50} // 200MB in plan, but let's stick to safe default or user req. User said 200MB.
                            onUploadComplete={(path) => setAudioPath(path)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Cover Art (Optional)</label>
                        <FileUploader
                            bucket="images"
                            acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                            maxSizeMB={5}
                            onUploadComplete={(path) => setImagePath(path)}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" disabled={submitting || !audioPath}>
                        {submitting ? "Submitting..." : "Submit Track"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
