# Smalito

Smalito is a fast, lightweight URL shortener built on Cloudflare Workers.
It runs entirely at the edge for low latency, high reliability, and simple scalability.

### Features

- Fast redirects using Cloudflare’s global edge
- HTTPS enabled by default
- Clean and minimal user interface
- Serverless architecture
- Simple JSON API for link creation

### Tech Stack

- Cloudflare Workers
- Workers + Assets
- JavaScript / TypeScript
- Cloudflare KV

### How It Works

1. A long URL is submitted through the UI or API
2. A short code is generated or validated
3. The mapping is stored
4. Requests to the short code are redirected at the edge
