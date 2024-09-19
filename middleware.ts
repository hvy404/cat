import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isLoginRoute = createRouteMatcher(["/login"]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();

  if (userId && isLoginRoute(req)) {
    // Redirect logged-in users from /login to /dashboard
    const response = new Response(null, {
      status: 302,
      headers: new Headers({
        Location: new URL("/dashboard", req.url).toString(),
      }),
    });
    response.headers.set(
      "x-middleware-rewrite",
      response.headers.get("Location") || ""
    );
    return response;
  }

  if (!userId && isProtectedRoute(req)) {
    const authToken = req.cookies.get("__session");

    if (authToken) {
      return new Response(null, { status: 200 });
    }

    const response = new Response(null, {
      status: 302,
      headers: new Headers({
        Location: new URL("/login", req.url).toString(),
      }),
    });
    response.headers.set(
      "x-middleware-rewrite",
      response.headers.get("Location") || ""
    );
    return response;
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
