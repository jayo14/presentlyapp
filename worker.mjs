export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    // If it's not an API call and we get a 404, serve index.html for SPA routing
    if (response.status === 404 && !url.pathname.startsWith('/api/')) {
      const indexRequest = new Request(new URL('/index.html', url.origin));
      return env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
