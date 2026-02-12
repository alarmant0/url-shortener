export async function handleAdminRequest(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
    const endpoint = url.pathname.split("/")[2];
    const pathname = url.pathname.split("/")[1];
    const code = url.pathname.split("/")[3];
	if (endpoint === "get") {
        console.log("HERE") // -----------------------------
        const all_links = await env.URLS.list();
        const info = [];

        for (const element of all_links.keys) {
            const linkStr = await env.URLS.get(element.name);
            if (!linkStr) continue;
            const link = JSON.parse(linkStr);
            const _smalito_url = `${url.origin}/${element.name}`;
            info.push({
                original_url: link.full_url,
                smalito_url: _smalito_url,
                clicks: link.clicks ?? 0,
                created_at: link.created_at ?? Date.now(),
                code: element.name
            });
        }

        const body = {
            total_links: info.length,
            links: info,
        };

        return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
    }
    if (endpoint === "delete") {
    	await env.URLS.delete(code);
    	return new Response("Successful delete", {
	        status: 200
	    });
    }
    else {
	    const file = "/views/admin.html";
	    const assetUrl = new URL(file, request.url);

	    const assetRequest = new Request(assetUrl.toString(), {
	        method: "GET",
	        headers: request.headers,
	    });

	    const response = await env.ASSETS.fetch(assetRequest);

	    if (response.status === 404) {
	        return new Response("Not Found", { status: 404 });
	    }

	    return response;
	}
	return new Response("Not Found", { status: 404 });

}