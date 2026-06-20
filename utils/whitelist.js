const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "whitelist.json");

function load() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify([], null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}

function save(list) {
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
}

function isAllowed(userId) {
  const ownerId = process.env.BOT_OWNER_ID;
  if (ownerId && userId === ownerId) return true;
  return load().includes(userId);
}

function add(userId) {
  const list = load();
  if (!list.includes(userId)) {
    list.push(userId);
    save(list);
    return true;
  }
  return false;
}

function remove(userId) {
  const list = load();
  const idx = list.indexOf(userId);
  if (idx !== -1) {
    list.splice(idx, 1);
    save(list);
    return true;
  }
  return false;
}

function getAll() {
  return load();
}

module.exports = { isAllowed, add, remove, getAll };
