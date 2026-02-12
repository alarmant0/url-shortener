import { handleApiRequest } from "./routes/api";
import { isValidShortCode } from "./utils/utils";
import { isAvailable } from "./services/controller";
import { handleAdminRequest } from "./routes/admin"


export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)
    let pathname = url.pathname
    // API LOGIC
    if (pathname.startsWith("/api") && request.method !== "GET") {
      const host = url.host
      const ip = request.headers.get("CF-Connecting-IP") ?? "unknown"

      const key = `${host}:api:${ip}`

      const { success } = await env.RATE_LIMITER.limit({ key })

      if (!success) {
        return new Response(
          "429 Failure – API rate limit exceeded",
          { status: 429 }
        )
      }
      return handleApiRequest(request, env)
    }
    if (pathname.slice(1).startsWith(env.ADMIN_URL)) {
      return handleAdminRequest(request, env)
    }
    // Code logic
    const code = pathname.slice(1).trim()
    if (isValidShortCode(code)) {
      const j_obj_raw = await isAvailable(code, env)
      const j_obj = typeof j_obj_raw === "string" ? JSON.parse(j_obj_raw) : j_obj_raw
      const { full_url } = j_obj
      if (full_url) {
        return Response.redirect(full_url);
      }
    }
    //
    // ASSETS LOGIC
    if (pathname === "/") {
      pathname = "index.html";
    } 

    const assetUrl = new URL(pathname, request.url);

    const assetRequest = new Request(assetUrl.toString(), {
      method: "GET",
      headers: request.headers,
    });

    const response = await env.ASSETS.fetch(assetRequest);

    if (response.status === 404) {
      return new Response("Not Found", { status: 404 });
    }

    return response;
  },
} satisfies ExportedHandler<Env>;
