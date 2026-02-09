export async function isAvailable(url: string, env: Env): Promise<boolean> {
	const value = await env.urls.get(url);
	return value;
}

export async function cput(small_url: string, url: string, env: Env): Promise<boolean> {
	const smalito_url = "https://smalito.com/" + small_url;
	let value = await env.urls.put(smalito_url, url);
	return true;
}