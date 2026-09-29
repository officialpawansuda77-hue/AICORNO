import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Protected routes requiring Clerk authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/favorites(.*)',
  '/submit(.*)',
  '/admin(.*)',
]);

const defaultSecretKey = 'sk_test_EQUwddTYo5uSPuzQwQuBTC30mbdWXK3uDD7wU8Pr32';
const defaultPublishableKey = 'pk_test_YWRhcHRlZC1ld2UtNDk4NS5jbGVyay5hY2NvdW50cy5kZXYk';

const clerkHandler = clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    secretKey: process.env.CLERK_SECRET_KEY || defaultSecretKey,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || defaultPublishableKey,
  }
);

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
