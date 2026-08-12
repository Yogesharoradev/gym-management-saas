"""Reverse proxy: forwards /api/* to the Next.js full-stack app on port 3000.

The platform ingress routes all /api/* traffic to this service (port 8001) while
serving everything else from Next.js (port 3000). Since this project is a Next.js
full-stack app whose API route handlers live on port 3000, we transparently proxy
/api/* to Next.js, preserving method, headers, query, body and Set-Cookie headers.
"""
import httpx
from fastapi import FastAPI, Request, Response

NEXT_TARGET = "http://localhost:3000"
EXCLUDED_RESPONSE_HEADERS = {
    "content-length",
    "content-encoding",
    "transfer-encoding",
    "connection",
}

app = FastAPI(title="Gym SaaS API Proxy")
client = httpx.AsyncClient(base_url=NEXT_TARGET, timeout=60.0)


@app.get("/api/_proxy/health")
async def health() -> dict:
    return {"status": "ok", "proxy": "fastapi", "target": NEXT_TARGET}


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
)
async def proxy(path: str, request: Request) -> Response:
    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
    upstream = await client.request(
        request.method,
        f"/api/{path}",
        params=dict(request.query_params),
        headers=headers,
        content=body,
    )
    response = Response(content=upstream.content, status_code=upstream.status_code)
    for key, value in upstream.headers.multi_items():
        if key.lower() in EXCLUDED_RESPONSE_HEADERS:
            continue
        response.headers.append(key, value)
    return response


@app.on_event("shutdown")
async def shutdown() -> None:
    await client.aclose()
