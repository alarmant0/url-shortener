export async function verifyTurnstile(
    token: string,
    ip: string,
    secret: string
): Promise<boolean> {

    const res = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                secret,
                response: token,
                remoteip: ip
            })
        }
    );

    const data = await res.json();

    return !!data.success;
}
