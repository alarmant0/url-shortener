import { createTinyURL } from "../utils/shortener.ts";
import { verifyTurnstile } from "../utils/verifyTurnstile.ts";

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {

    const url = new URL(request.url);
    const endpoint = url.pathname.split("/")[2];
    if (endpoint == "status") {
        return new Response(
            JSON.stringify({status:"healthy"}), 
            { headers : {"Content-Type": "application/json"}
        }); 
    }
    if (endpoint === "status") {
        return new Response(
            JSON.stringify({ status: "healthy" }),
            {
            status: 200,
            headers: { "Content-Type": "application/json" }
            }
        );
    }
    if (endpoint === "create") {
        let body;

        try {
            body = await request.json();
        } catch (err) {
            return new Response(
            JSON.stringify({ error: "Invalid or missing JSON body" }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" }
            }
            );
        }

        const { full_url, custom_code, turnstileToken } = body;

        if (!full_url) {
            return new Response(
                JSON.stringify({ error: "Missing required field: full_url" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }
        if (!turnstileToken) {
            return new Response(
                JSON.stringify({ error: "Missing Turnstile token" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }

        const ip = request.headers.get("CF-Connecting-IP") ?? "";

        const isValid = await verifyTurnstile(
            turnstileToken,
            ip,
            env.TURNSTILE_SECRET
        );

        if (!isValid && url.hostname !== "127.0.0.1") { // change this
            return new Response(
                JSON.stringify({ error: "Turnstile verification failed" }),
                {
                    status: 403,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }
        
        const shortcode = await createTinyURL(full_url, custom_code, env);

        if (shortcode === "Error") {
            return new Response(
            JSON.stringify({ error: "Short code already exists" }),
            {
                status: 409,
                headers: { "Content-Type": "application/json" }
            }
            );
        }

        const host = new URL(request.url).origin;
        const tinyurl = `${host}/${shortcode}`;

        return new Response(
            JSON.stringify({ url: tinyurl }),
            {
            status: 201,
            headers: { "Content-Type": "application/json" }
            }
        );
    }
    return new Response(
        JSON.stringify({ error: "Not Found" }),
        {
            status: 404,
            headers: { "Content-Type": "application/json" }
        }
    );

}

async function handleHealthStatus() : Promise<Response> {
    return new Response(
        JSON.stringify({status:"healthy"}), 
        { headers : {"Content-Type": "application/json"}
    });
}