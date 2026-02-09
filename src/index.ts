import { handleApiRequest } from "./routes/api";
import { isValidShortCode } from "./utils/utils.ts";
import { isAvailable } from "./services/controller.ts";


export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api")) {
      return handleApiRequest(request, env);
    }
    const code = url.pathname.slice(1).trim();
    if (isValidShortCode(code)) {
      const smalito_url = "https://smalito.com/" + code;
      const full_url = await isAvailable(smalito_url, env);
      if (isAvailable !== null) {
        return Response.redirect(full_url);
      }
    }
    let filename = url.pathname;
    if (filename === "/") {
      filename = "/views/index.html";
    } 

    const assetUrl = new URL(filename, request.url);

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
