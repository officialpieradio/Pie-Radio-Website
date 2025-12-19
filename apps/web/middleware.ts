import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 1. Security Headers (CSP, HSTS)
    // Note: Strict CSP often conflicts with Next.js development tools and some third-party scripts.
    // We apply a baseline policy here.
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co https://*.googleusercontent.com https://i.scdn.co https://cdn.discordapp.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://*.aiir.com https://api.stripe.com;
    media-src 'self' https://*.aiir.com blob:;
    frame-src 'self' https://js.stripe.com;
  `;
    // Replace newlines with spaces
    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, " ")
        .trim();

    response.headers.set(
        "Content-Security-Policy",
        contentSecurityPolicyHeaderValue
    );

    // HSTS
    response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
    );

    // 2. Supabase Session Refresh
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // 3. RBAC / Protected Routes
    const url = request.nextUrl.clone();

    // Protect /admin routes
    if (url.pathname.startsWith("/admin")) {
        if (!user) {
            // Redirect unauthenticated checks
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        // Note: Full Role check usually requires database access. 
        // Middleware usually just checks *authentication*.
        // We can check a custom claim or cookie if we optimized for it, 
        // but strictly speaking, calling DB in middleware is expensive.
        // For now, we assume authenticated users can hit the route, and the *page* data fetching
        // will fail via RLS if they aren't authorized (or we do a secondary check on layout).
    }

    // Protect /dashboard routes (Presenter)
    if (url.pathname.startsWith("/dashboard")) {
        if (!user) {
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
