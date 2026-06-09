export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    // If the asset is not found and it's not an API call, serve index.html for SPA routing
    if (response.status === 404 && !url.pathname.startsWith('/api')) {
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      return env.ASSETS.fetch(indexRequest);
    }

    return response;
  }
};
