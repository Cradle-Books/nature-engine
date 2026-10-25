/* Exercise the actual HTTP client against Django; only browser storage/Window
 * are represented in Node. fetch itself is never replaced. */
const fs = require("fs");
const ts = require("typescript");
process.env.NEXT_PUBLIC_API_BASE_URL = "http://127.0.0.1:4900";
fs.mkdirSync(".preview", { recursive: true });
fs.writeFileSync(".preview/http-test.mjs", ts.transpileModule(fs.readFileSync("lib/http.ts", "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText);
(async () => {
  const client = await import("../.preview/http-test.mjs"); const storage = new Map();
  global.sessionStorage = { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  global.window = new EventTarget();
  const expired = await (await fetch("http://127.0.0.1:4900/__integration__/expired-session")).json();
  client.storeSession(expired.access, expired.refresh, "reader");
  const before = await (await fetch("http://127.0.0.1:4900/__integration__/metrics")).json();
  const responses = await Promise.all([client.apiRequest("/api/books/library/fetch/", {}, true), client.apiRequest("/api/books/recommendations/", {}, true)]);
  const after = await (await fetch("http://127.0.0.1:4900/__integration__/metrics")).json();
  if ((after["/api/auth/token/refresh/"] || 0) - (before["/api/auth/token/refresh/"] || 0) !== 1) throw new Error("Concurrent refresh was not deduplicated.");
  if (!Array.isArray(responses[0].books) || !Array.isArray(responses[1].results)) throw new Error("Retried responses were invalid.");
  console.log("PASS concurrent expired-token requests share one refresh and both retry successfully");
})().catch(error => { console.error(error.message); process.exitCode = 1; });
