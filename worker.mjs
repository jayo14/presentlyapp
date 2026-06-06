export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (response.status === 404 && request.method === 'GET' && !url.pathname.startsWith('/api')) {
      const indexRequest = new Request(new URL('/index.html', request.url));
      return env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
