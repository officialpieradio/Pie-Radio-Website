"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { signInWithGoogle, user, isLoading } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const router = useRouter();

    if (user && !isLoading) {
        router.push("/"); // Already logged in
        return null;
    }

    const handleGoogleLogin = async () => {
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
            // Redirect handled by OAuth flow
        } catch (error) {
            console.error("Login failed", error);
            setIsSigningIn(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div className="w-full max-w-sm space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-display tracking-tight text-primary">Sign In</h1>
                    <p className="text-muted-foreground">Join the community to chat, request songs, and more.</p>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full relative"
                        onClick={handleGoogleLogin}
                        disabled={isSigningIn || isLoading}
                    >
                        {isSigningIn ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        size="lg"
                        className="w-full"
                        disabled
                    >
                        Email Sign In (Coming Soon)
                    </Button>
                </div>
            </div>
        </div>
    );
}
