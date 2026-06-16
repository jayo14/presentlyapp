export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy API requests to the Render backend
    if (url.pathname.startsWith('/api')) {
      const backendBase = env.BACKEND_URL || 'https://presentlyapp-alpha.onrender.com';
      const backendUrl = new URL(url.pathname + url.search, backendBase);
      const modifiedRequest = new Request(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow'
      });
      return await fetch(modifiedRequest);
    }

    // Attempt to serve from assets
    try {
      let response = await env.ASSETS.fetch(request);

      // If asset not found (404), serve index.html for SPA routing
      if (response.status === 404) {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      }

      return response;
    } catch (e) {
      // Fallback for SPA routing if ASSETS.fetch fails
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      return await env.ASSETS.fetch(indexRequest);
    }
  }
};
