import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Allow unauthenticated access to the OpenRouter proxy so generation works
  // even if Clerk is misconfigured or you're not logged in yet.
  publicRoutes: ["/api/openrouter-generate"],
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
