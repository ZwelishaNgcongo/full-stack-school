// middleware.ts - Replace your entire middleware file with this:
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This is the required export that Next.js is looking for
export function middleware(request: NextRequest) {
  // For now, just allow all requests through
  return NextResponse.next();
}

// Optional: You can also use default export instead:
// export default function middleware(request: NextRequest) {
//   return NextResponse.next();
// }

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
