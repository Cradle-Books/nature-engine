/* Real HTTP failure checks using the test-only proxy controls in integration_backend.py. */
let socket;
(async () => {
  const pages = await (await fetch("http://127.0.0.1:9227/json")).json();
  socket = new WebSocket(pages.find(p => p.type === "page").webSocketDebuggerUrl); await new Promise(r => { socket.onopen = r; });
  let id = 0; const pending = new Map(); socket.onmessage = e => { const d = JSON.parse(e.data); if (d.id) { pending.get(d.id)(d.result); pending.delete(d.id); } };
  const call = (method, params = {}) => new Promise(resolve => { const n = ++id; pending.set(n, resolve); socket.send(JSON.stringify({ id: n, method, params })); });
  const ev = async expression => (await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result.value;
  const wait = async (exp, label) => { for (let i = 0; i < 100; i++) { if (await ev(exp)) return; await new Promise(r => setTimeout(r, 150)); } throw new Error(label + ": " + await ev("document.body.innerText.slice(-700)")); };
  const go = async path => { await call("Page.navigate", { url: "http://localhost:3103" + path }); await new Promise(r => setTimeout(r, 500)); };
  const mode = name => fetch("http://127.0.0.1:4900/__integration__/control?mode=" + name);
  const login = await (await fetch("http://127.0.0.1:4900/api/auth/login/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ Username: "reader", Password: "test-password-123" }) })).json();
  await ev(`sessionStorage.setItem('bookapp.access',${JSON.stringify(login.access)});sessionStorage.setItem('bookapp.refresh',${JSON.stringify(login.refresh)});`);
  await mode("books-error"); await go("/dashboard"); await wait('!!document.querySelector(".dashboard-recommendations [role=alert]")', "recommendation error state");
  if (await ev('document.querySelectorAll(".dashboard-book-grid button").length!==0')) throw new Error("Failure silently displayed recommendation data");
  await mode("normal"); await ev('document.querySelector(".dashboard-recommendations .live-state button").click()'); await wait('document.querySelectorAll(".dashboard-book-grid button").length>0', "recommendation retry"); console.log("PASS HTML API failure shows an error; retry recovers real recommendations");
  await mode("profile-error"); await go("/dashboard"); await wait('!!document.querySelector(".session-status [role=alert]")', "profile error");
  if (!await ev('!!sessionStorage.getItem("bookapp.access") && location.pathname==="/dashboard"')) throw new Error("Transient profile failure cleared the session");
  await mode("normal"); await ev('document.querySelector(".session-status .button--primary").click()'); await wait('!!document.querySelector(".dashboard-statistics")', "profile retry"); console.log("PASS transient profile failure keeps credentials and recovers without login");
  await mode("logout-error"); await ev('document.querySelector(".account-menu").open=true;document.querySelector(".account-links button").click()');
  await wait('location.pathname==="/" && !!document.querySelector(".logout-notice")', "local logout notice");
  if (await ev('!!sessionStorage.getItem("bookapp.access") || !!sessionStorage.getItem("bookapp.refresh")')) throw new Error("Failed remote logout retained credentials"); console.log("PASS failed remote logout still clears this device and explains the result");
  await mode("landing-error"); await go("/"); await wait('!!document.querySelector(".landing-books [role=alert]")', "landing error"); await mode("normal"); await ev('document.querySelector(".landing-books .live-state button").click()'); await wait('document.querySelectorAll(".landing-book-grid button").length>0', "landing retry"); console.log("PASS public book loading failure and retry");
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => { await fetch("http://127.0.0.1:4900/__integration__/control?mode=normal").catch(() => {}); socket?.close(); });
