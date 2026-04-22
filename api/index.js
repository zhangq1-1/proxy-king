export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  let target = url.pathname.replace(/^\/api\/?/, '').replace(/^\/+/, '') + url.search;
  target = target.replace(/^(https?):\/+/, '$1://');

  if (!target || target === "favicon.ico") {
    return new Response("Vercel Proxy Online", { status: 200 });
  }
  if (!target.startsWith("http")) target = "https://" + target;

  const targetUrl = new URL(target);
  const safeHeaders = new Headers();

  const auth = req.headers.get("authorization");
  if (auth) safeHeaders.set("authorization", auth);
  const ct = req.headers.get("content-type");
  if (ct) safeHeaders.set("content-type", ct);
  const ac = req.headers.get("accept");
  if (ac) safeHeaders.set("accept", ac);

  safeHeaders.set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36");
  safeHeaders.set("host", targetUrl.hostname);

  try {
    return await fetch(new Request(target, { method: req.method, headers: safeHeaders, body: req.body }));
  } catch(e) {
    return new Response("Upstream Error", { status: 502 });
  }
}
