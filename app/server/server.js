Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('Hello World!'),
    '/content/:id': async req => {
      const url = new URL(req.url)
      let searchParams = url.searchParams;
      searchParams.delete('ssr');
      console.log('https://blue.vermilion.place/api/inscription/' + req.params.id + url.search);
      return await fetchContent(req.params.id, url.search);
    }
  }
});

async function fetchContent(id, search) {
  const res = await fetch('https://blue.vermilion.place/api/inscription/' + id + search);
  return res;
}