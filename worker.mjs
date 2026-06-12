export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy /api calls to Render backend
    if (url.pathname.startsWith('/api')) {
      const backendUrl = new URL(request.url);
      backendUrl.hostname = 'presentlyapp-alpha.onrender.com';
      backendUrl.protocol = 'https';
      backendUrl.port = ''; // Ensure no port is carried over

      const modifiedRequest = new Request(backendUrl, request);
      return fetch(modifiedRequest);
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
      try {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      } catch (e2) {
        return new Response("Not Found", { status: 404 });
      }
    }
  }
};
