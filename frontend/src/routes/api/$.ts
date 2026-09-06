import { createFileRoute } from "@tanstack/react-router";

/**
 * The Spring Boot backend lives at VITE_API_BASE_URL (default http://localhost:8080/api).
 * If a request ever hits this app's own /api/* path, answer with a clear JSON 404 instead of
 * letting the SSR handler blow up with a blank 500 page.
 */
function notFound({ request }: { request: Request }) {
  const { pathname } = new URL(request.url);
  return new Response(
    JSON.stringify({
      status: 404,
      message: `No backend route ${pathname} in this frontend. The REST API is a separate Spring Boot service — set VITE_API_BASE_URL to its address.`,
    }),
    { status: 404, headers: { "content-type": "application/json" } },
  );
}

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: notFound,
      POST: notFound,
      PUT: notFound,
      PATCH: notFound,
      DELETE: notFound,
    },
  },
});
