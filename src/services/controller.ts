export async function isAvailable(url: string, env: Env): Promise<boolean> {
	const value = await env.URLS.get(url);
	return value;
}

export async function cput(code: string, url: string, env: Env): Promise<boolean> {
	const existing = await env.URLS.get(code);
	if (existing !== null) {
		return false;
	}

	const body = {
		full_url: url,
		clicks: 0,
		created_at: Date.now()
	};

	await env.URLS.put(code, JSON.stringify(body));
	return true;
}
