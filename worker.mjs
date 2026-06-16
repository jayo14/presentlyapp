export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy API requests to the Render backend
    if (url.pathname.startsWith('/api')) {
      const backendBase = env.BACKEND_URL;

      if (!backendBase) {
        return new Response("Configuration Error: BACKEND_URL not defined", { status: 500 });
      }

      const backendUrl = new URL(url.pathname + url.search, backendBase);

      // Create request options without body for GET/HEAD
      const requestOptions = {
        method: request.method,
        headers: request.headers,
        redirect: 'follow'
      };

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        requestOptions.body = request.body;
      }

      try {
        const modifiedRequest = new Request(backendUrl, requestOptions);
        return await fetch(modifiedRequest);
      } catch (proxyError) {
        console.error('API Proxy Error:', proxyError);
        return new Response("API Proxy Error", { status: 502 });
      }
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
