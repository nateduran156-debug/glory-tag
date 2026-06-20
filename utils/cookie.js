const fs = require("fs");
const path = require("path");
const noblox = require("noblox.js");

const FILE = path.join(__dirname, "..", "cookie.txt");

function saveCookie(cookie) {
  fs.writeFileSync(FILE, cookie.trim(), "utf8");
}

function loadCookie() {
  if (fs.existsSync(FILE)) {
    const saved = fs.readFileSync(FILE, "utf8").trim();
    if (saved) return saved;
  }
  return (process.env.ROBLOX_COOKIE || "").trim();
}

async function applyCookie(cookie) {
  await noblox.setCookie(cookie.trim(), false);
  saveCookie(cookie);
  const me = await noblox.getCurrentUser();
  return me;
}

module.exports = { saveCookie, loadCookie, applyCookie };
