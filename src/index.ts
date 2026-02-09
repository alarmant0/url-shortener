import { handleApiRequest } from "./routes/api";
import { messageRequests } from "./routes/message";


export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      return handleApiRequest(request);
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
