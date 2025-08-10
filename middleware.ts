import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/api/openrouter-generate",
  "/favicon.ico",
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return;
  // For all other routes, enforce default Clerk behavior
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes (public ones are handled in code above)
    "/(api|trpc)(.*)",
  ],
};
