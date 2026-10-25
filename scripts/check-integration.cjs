/* Browser-to-Django regression checks. Requires the isolated runner on :4900,
 * Next on :3103 configured for that API, and a local Chrome CDP endpoint :9227.
 * Uses synthetic .test accounts only. No external mail is sent by the runner.
 */
const fs = require("fs");
let socket;
(async () => {
  const pages = await (await fetch("http://127.0.0.1:9227/json")).json();
  socket = new WebSocket(pages.find(page => page.type === "page").webSocketDebuggerUrl);
  await new Promise(resolve => { socket.onopen = resolve; });
  let id = 0; const pending = new Map();
  socket.onmessage = event => { const data = JSON.parse(event.data); if (data.id) { const task = pending.get(data.id); pending.delete(data.id); data.error ? task.reject(data.error) : task.resolve(data.result); } };
  const call = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, { resolve, reject }); socket.send(JSON.stringify({ id: next, method, params })); });
  const evaluate = async expression => { const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; };
  const wait = async (expression, label) => { for (let count = 0; count < 100; count++) { if (await evaluate(expression)) return; await new Promise(resolve => setTimeout(resolve, 150)); } throw new Error(`Timed out: ${label}; ${await evaluate("location.pathname+' '+document.body.innerText.slice(-700)")}`); };
  const go = async route => { await call("Page.navigate", { url: `http://localhost:3103${route}` }); await wait('document.readyState === "complete"', "document ready"); await new Promise(resolve => setTimeout(resolve, 300)); };
  const fill = (id, value) => evaluate(`(() => { const el=document.getElementById(${JSON.stringify(id)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)}); el.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  const submit = () => evaluate('document.querySelector("form.auth-form").requestSubmit()');
  const assert = (value, label) => { if (!value) throw new Error(label); console.log("PASS", label); };
  const login = async username => { await go("/login"); await wait('!!document.querySelector("#username")', "login form"); await fill("username", username); await fill("password", "test-password-123"); await submit(); await wait('location.pathname==="/dashboard" && !!document.querySelector(".dashboard-statistics")', "dashboard"); };
  await go("/login"); await evaluate("sessionStorage.clear()"); await go("/");
  await wait('document.querySelectorAll(".landing-book-grid button").length===6', "public trending"); console.log("PASS public landing loads six API books");
  await evaluate('document.querySelector(".landing-book-grid button").click()'); await wait('document.querySelector("dialog[open]")?.innerText.includes("320")', "page count"); console.log("PASS guest book details preserve page count");
  await go("/dashboard"); await wait('location.pathname==="/login" && !!document.querySelector("#username")', "guest guard"); console.log("PASS dashboard requires login");
  await fill("username", "reader"); await fill("password", "incorrect-password"); await submit(); await wait('document.querySelector(".auth-error")?.textContent.includes("Invalid")', "invalid credentials"); assert(await evaluate('!sessionStorage.getItem("bookapp.access")'), "invalid login stores no session");
  const username = `newreader${Date.now()}`; const email = `${username}@example.test`;
  await go("/signup"); await wait('!!document.querySelector("#confirmation")', "signup form");
  await fill("username", username); await fill("email", email); await fill("password", "test-password-123"); await fill("confirmation", "test-password-123"); await submit();
  await wait('location.pathname==="/verify-otp" && !!document.querySelector("#otp")', "verification route");
  assert(await evaluate(`document.querySelector('#email').value===${JSON.stringify(email)}`), "verification preserves submitted email");
  await fill("otp", "000000"); await submit(); await wait('document.querySelector(".auth-error")?.textContent.includes("Invalid OTP")', "invalid OTP");
  const mailbox = await (await fetch("http://127.0.0.1:4900/__integration__/mailbox")).json(); await fill("otp", mailbox[email]); await submit();
  await wait('location.pathname==="/login" && !!document.querySelector(".auth-success")', "verification success"); console.log("PASS actual signup and invalid/valid OTP flow");
  await fill("username", username); await fill("password", "test-password-123"); await submit();
  await wait('location.pathname==="/dashboard" && document.querySelector("#recommendations-title")?.textContent==="Popular on Cradle"', "empty account fallback");
  assert(await evaluate(`[...document.querySelectorAll('.dashboard-statistics dd')].slice(0,3).every(e=>e.innerText.trim()==='0') && document.querySelector('h1').textContent.includes(${JSON.stringify(username)})`), "new account has its own username and zero counts");
  await evaluate('document.querySelector(".account-menu").open=true; document.querySelector(".account-links button").click()');
  await wait('location.pathname==="/" && !!document.querySelector(".landing-hero")', "logout home redirect"); assert(await evaluate('!sessionStorage.getItem("bookapp.access")&&!sessionStorage.getItem("bookapp.refresh")'), "logout clears session and returns home");
  await login("reader"); await wait('document.querySelectorAll(".dashboard-book-grid button").length>0', "recommendations");
  const countBefore = await evaluate('Number(document.querySelectorAll(".dashboard-statistics dd")[2].innerText.trim())');
  await evaluate('document.querySelector(".dashboard-book-grid button").click()'); await wait('document.querySelector("dialog[open]")?.innerText.includes("320")', "book details");
  await evaluate('document.querySelector(".book-dialog-actions button").click()'); await wait('document.querySelector("dialog[open]")?.innerText.includes("want to read shelf")', "saved book");
  await wait(`Number(document.querySelectorAll('.dashboard-statistics dd')[2].innerText.trim())===${countBefore + 1}`, "updated shelf count"); console.log("PASS recommendation save persists and updates profile");
  await wait('!!document.querySelector(".book-shelf-control select")', "saved shelf selector");
  await evaluate('(()=>{const select=document.querySelector(".book-shelf-control select");select.value="reading";select.dispatchEvent(new Event("change",{bubbles:true}));})()');
  await wait('document.querySelector(".book-dialog-actions [role=status]")?.textContent.includes("currently reading")', "reading shelf update"); console.log("PASS saved book reading status persists through the API");
  await evaluate('document.querySelector("dialog[open] .icon-button").click()');
  if (await evaluate('!![...document.querySelectorAll(".reading-actions button")].find(b=>b.textContent==="Mark finished")')) {
    const completed = await evaluate('Number(document.querySelectorAll(".dashboard-statistics dd")[0].innerText.trim())');
    await evaluate('[...document.querySelectorAll(".reading-actions button")].find(b=>b.textContent==="Mark finished").click()');
    await wait(`Number(document.querySelectorAll('.dashboard-statistics dd')[0].innerText.trim())===${completed + 1}`, "finished count"); console.log("PASS marking finished updates live counts");
  }
  const expired = await (await fetch("http://127.0.0.1:4900/__integration__/expired-session")).json();
  await evaluate(`sessionStorage.setItem('bookapp.access',${JSON.stringify(expired.access)}); sessionStorage.setItem('bookapp.refresh',${JSON.stringify(expired.refresh)});`);
  await go("/"); await wait('location.pathname==="/dashboard" && !!document.querySelector(".dashboard-statistics")', "expired access refresh");
  assert(await evaluate(`sessionStorage.getItem('bookapp.access')!==${JSON.stringify(expired.access)}`), "expired access refreshes and signed-in landing redirects");
  for (const [name, width, height, mobile] of [["desktop",1440,1050,false],["mobile",390,844,true]]) {
    await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
    assert(await evaluate("document.documentElement.scrollWidth<=innerWidth"), `${name} has no page-width overflow`);
    const image = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }); fs.writeFileSync(`.preview/integrated-dashboard-${name}.png`, Buffer.from(image.data,"base64"));
  }
  await evaluate("sessionStorage.setItem('bookapp.access','invalid-access');sessionStorage.setItem('bookapp.refresh','invalid-refresh')");
  await go("/dashboard"); await wait('location.pathname==="/login" && !!document.querySelector("#username")', "invalid refresh");
  assert(await evaluate('!sessionStorage.getItem("bookapp.access")&&!sessionStorage.getItem("bookapp.refresh")'), "invalid refresh clears credentials and redirects to login");
  console.log("All browser-to-Django integration checks passed.");
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => socket?.close());
