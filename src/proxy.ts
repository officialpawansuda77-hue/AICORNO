import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Protected routes requiring Clerk authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/favorites(.*)',
  '/submit(.*)',
  '/admin(.*)',
]);

const hasClerkSecret = Boolean(process.env.CLERK_SECRET_KEY);

const clerkHandler = hasClerkSecret
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : null;

// Next.js 16 Proxy / Middleware handler
export default async function middleware(request: NextRequest, event: any) {
  if (clerkHandler) {
    return clerkHandler(request, event);
  }
  return NextResponse.next();
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
