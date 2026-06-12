export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Proxy /api calls to Render backend
    if (url.pathname.startsWith('/api')) {
      const targetUrl = 'https://presentlyapp-alpha.onrender.com' + url.pathname + url.search;

      // Clone the request to preserve headers and body for the proxy
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'manual'
      });

      return fetch(proxyRequest);
    }

    // 2. Try to serve static assets from the ASSETS binding
    try {
      const response = await env.ASSETS.fetch(request);
      // If we got a valid response (not a 404), return it
      if (response && response.status !== 404) {
        return response;
      }
    } catch (e) {
      console.error('Asset fetch error:', e);
    }

    // 3. SPA Fallback: Serve index.html for all other routes
    try {
      const indexUrl = new URL('/index.html', request.url);
      const indexRequest = new Request(indexUrl, request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);

      if (indexResponse && indexResponse.status !== 404) {
        return indexResponse;
      }
    } catch (e) {
      console.error('SPA fallback error:', e);
    }

    // 4. Final fallback
    return new Response("Not Found", { status: 404 });
  }
};
