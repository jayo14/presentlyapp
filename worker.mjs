export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    // If the request is for an API or another known path, don't intercept 404s
    if (url.pathname.startsWith('/api')) {
      return response;
    }

    // If 404 and not an API call, serve index.html for SPA routing
    if (response.status === 404) {
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      return env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
