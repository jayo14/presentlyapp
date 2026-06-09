export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Attempt to serve from assets
    try {
      let response = await env.ASSETS.fetch(request);

      // If asset not found (404) and not an API call, serve index.html for SPA routing
      if (response.status === 404 && !url.pathname.startsWith('/api')) {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      }

      return response;
    } catch (e) {
      // Fallback for SPA routing if ASSETS.fetch fails with 404
      if (!url.pathname.startsWith('/api')) {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        return await env.ASSETS.fetch(indexRequest);
      }
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};
