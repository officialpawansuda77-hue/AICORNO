import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Protected routes requiring Clerk authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/favorites(.*)',
  '/submit(.*)',
  '/admin(.*)',
]);

// Clerk reads the configured production keys from the environment. Never
// silently fall back to a test instance in a deployed build.

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// Next.js 16 Proxy / Middleware handler
export default async function middleware(request: NextRequest, event: any) {
  try {
    return await clerkHandler(request, event);
  } catch (err) {
    console.warn('[Proxy Middleware Notice]:', err);
    return NextResponse.next();
  }
}

export async function proxy(request: NextRequest, event: any) {
  return middleware(request, event);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
