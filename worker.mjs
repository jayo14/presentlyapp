export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    // Serve index.html for SPA routing on 404s, unless it's an API call
    if (response.status === 404 && !url.pathname.startsWith('/api/')) {
      const indexRequest = new Request(new URL('/index.html', request.url));
      return env.ASSETS.fetch(indexRequest);
    }

    return response;
  }
};
