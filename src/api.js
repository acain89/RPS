export async function api(path, opts={}) {
  console.log("[API]", path, opts);
  return { ok: true };
}
