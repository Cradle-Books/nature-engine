/* Local test-only contract double, based on backend authentication/books views and serializers.
 * No account or mail is created outside this simulation. Tokens are intentionally synthetic.
 * No owning workspace mock was searched: this repository owns the API, and CLI is signed out.
 */
const http = require("http");
const seedBook = id => ({ id, title: `Reading Together ${id}`, author: "Cradle Test Author", cover: null, genre: ["Fiction"], description: "A local integration fixture about books and friendship.", release_date: 2024, page_count: 320, average_rating: 4.2, external_id: `/works/test${id}` });
http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (["http://localhost:3103", "http://127.0.0.1:3103"].includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const respond = (code, data) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(data)); };
  let state = await pm.state.get("cradle.fixtures");
  if (!state) {
    state = { users: {}, pending: {}, revoked: [], nextEntry: 4 };
    for (const username of ["reader", "empty", "errorprofile", "errorbooks"]) state.users[username] = { password: "test-password-123", email: `${username}@example.test`, entries: username === "empty" ? [] : [1, 2, 3].map((id, index) => ({ id, book: id, status: ["reading", "finished", "want"][index], ratings: null, review: null })) };
    await pm.state.set("cradle.fixtures", state);
  }
  const save = () => pm.state.set("cradle.fixtures", state);
  const path = new URL(req.url, "http://localhost").pathname;
  const body = req.body || {};
  const token = String(req.headers.authorization || "").replace(/^Bearer /, "");
  const username = token.startsWith("mock-access-") ? token.slice(12) : "";
  const user = state.users[username];
  if (path === "/auth/signup/" && req.method === "POST") {
    if (!body.Email || !body.Username || !body.Password || body.Password !== body.Confirm_Password) return respond(400, { Confirm_Password: ["Passwords must match."] });
    if (state.users[body.Username] || Object.values(state.users).some(u => u.email === body.Email)) return respond(400, { message: "These details already exist in our system, please sign in!" });
    state.pending[body.Email] = { ...body }; await save(); return respond(200, { message: "OTP sent successfully, check your email!", Email: "email" });
  }
  if (path === "/auth/verify-otp/" && req.method === "POST") {
    const pending = state.pending[body.Email];
    if (!pending) return respond(400, { error: "Signup session expired or invalid email" });
    if (body.OTP !== "123456") return respond(400, { error: "Invalid OTP" });
    state.users[pending.Username] = { password: pending.Password, email: pending.Email, entries: [] }; delete state.pending[body.Email]; await save(); return respond(201, { message: "Registration successful" });
  }
  if (path === "/auth/login/" && req.method === "POST") {
    if (!state.users[body.Username] || state.users[body.Username].password !== body.Password) return respond(401, { message: "Invalid Credentials" });
    state.revoked = state.revoked.filter(t => t !== `mock-refresh-${body.Username}`); await save();
    return respond(200, { username: body.Username, access: `mock-access-${body.Username}`, refresh: `mock-refresh-${body.Username}` });
  }
  if (path === "/auth/token/refresh/" && req.method === "POST") {
    const name = String(body.refresh || "").replace(/^mock-refresh-/, "");
    if (!state.users[name] || state.revoked.includes(body.refresh)) return respond(401, { detail: "Token is invalid or expired" });
    return respond(200, { access: `mock-access-${name}` });
  }
  if (path === "/books/trending/") return respond(200, { results: [4, 5, 6, 7, 8, 9].map(id => { const b = seedBook(id); return { id: b.id, title: b.title, author: b.author, cover: b.cover, score: 6, number_of_readers: 2 }; }) });
  const detail = path.match(/^\/books\/book\/(\d+)\/$/);
  if (detail) return Number(detail[1]) > 9 ? respond(404, { message: "Book not found" }) : respond(200, { ...seedBook(Number(detail[1])), recent_activity: [] });
  if (!user) return respond(401, { detail: "Authentication credentials were not provided." });
  if (path === "/auth/logout/" && req.method === "POST") { state.revoked.push(body.refresh); await save(); return respond(200, { message: "Logout successful" }); }
  if (path === "/books/profile/") {
    if (username === "errorprofile") return respond(503, { message: "Profile temporarily unavailable" });
    return respond(200, { username, total_books: user.entries.length, reading: user.entries.filter(e => e.status === "reading").length, finished: user.entries.filter(e => e.status === "finished").length, want_to_read: user.entries.filter(e => e.status === "want").length, average_rating: null });
  }
  if (path === "/books/recommendations/") {
    if (username === "errorbooks") { res.writeHead(503, { "Content-Type": "text/html" }); return res.end("<h1>Service unavailable</h1>"); }
    return respond(200, { results: user.entries.length ? [4, 5, 6, 7, 8].filter(id => !user.entries.some(e => e.book === id)).map(id => { const b = seedBook(id); return { id, title: b.title, author: b.author, cover: b.cover, match_score: 1 }; }) : [] });
  }
  if (path === "/books/library/fetch/") return respond(200, { amount: user.entries.length, books: user.entries.map(entry => ({ ...entry, book_details: seedBook(entry.book) })) });
  if (path === "/books/library/" && req.method === "POST") {
    if (user.entries.some(e => e.book === body.book)) return respond(400, { book: ["Book already exists in your library."] });
    const entry = { id: state.nextEntry++, book: body.book, status: body.status || "want", ratings: null, review: null }; user.entries.push(entry); await save(); return respond(201, { data: entry });
  }
  const update = path.match(/^\/books\/library\/update\/(\d+)\/$/);
  if (update && req.method === "PATCH") {
    const entry = user.entries.find(e => e.id === Number(update[1])); if (!entry) return respond(404, { message: "Book not found in your library" });
    if (!["want", "reading", "finished"].includes(body.status)) return respond(400, { status: ["Invalid status"] });
    entry.status = body.status; await save(); return respond(200, { data: entry });
  }
  return respond(501, { message: "Endpoint not modelled by the integration simulation." });
}).listen(process.env.PORT || 4900);
