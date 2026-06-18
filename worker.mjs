export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy API requests to the backend
    if (url.pathname.startsWith('/api/')) {
      const backendUrl = env.BACKEND_URL || 'https://presentlyapp-alpha.onrender.com';
      const targetUrl = new URL(url.pathname + url.search, backendUrl);

      const proxyOptions = {
        method: request.method,
        headers: request.headers,
        redirect: "follow"
      };

      // Cloudflare Workers restriction: GET/HEAD requests cannot have a body
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        proxyOptions.body = request.body;
      }

      return fetch(new Request(targetUrl, proxyOptions));
    }

    // Attempt to serve from static assets
    try {
      let response = await env.ASSETS.fetch(request);

      // SPA Fallback: If asset not found (404), serve index.html
      if (response.status === 404) {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      }

      return response;
    } catch (e) {
      // Fallback if ASSETS.fetch fails
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      return await env.ASSETS.fetch(indexRequest);
    }
  }
};
