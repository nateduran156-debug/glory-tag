# Roblox Discord Bot

Discord bot for ranking users in Roblox group **35914267**.

## Commands

- `/role username` — Shows the 4 tag ranks as a dropdown. Pick one to assign it.
- `/strip target` — Exiles a user from the group. Use `everyone confirm` to exile everyone.
- `/whitelist add/remove/list` — Control who can use the bot.
- `/setcookie cookie` — Update the Roblox cookie from Discord (DM the bot, owner only).

---

## Setup (Step by Step)

### Step 1 — Install Node.js
Download from https://nodejs.org and install it (v18 or higher).

### Step 2 — Install dependencies
Open a terminal in the bot folder and run:
```
npm install
```

### Step 3 — Create your Discord bot

1. Go to https://discord.com/developers/applications
2. Click **New Application**, give it a name
3. Go to the **Bot** tab → click **Add Bot**
4. Under **Token**, click **Reset Token** then copy it → this is your `DISCORD_BOT_TOKEN`
5. Scroll down and make sure these are **ON**:
   - **Server Members Intent**
   - **Message Content Intent** (optional but safe to enable)

### Step 4 — Fill in your .env file

Copy `.env.example` to `.env` and fill in every value:

```
DISCORD_BOT_TOKEN=    ← Token from Step 3
DISCORD_CLIENT_ID=    ← "General Information" tab → Application ID
DISCORD_GUILD_ID=     ← Right-click your server in Discord → Copy Server ID *
ROBLOX_COOKIE=        ← See below
ROBLOX_GROUP_ID=35914267
BOT_OWNER_ID=         ← Your own Discord user ID **
```

\* To see "Copy Server ID": go to Discord **Settings → Advanced → Developer Mode → ON**, then right-click your server.

\*\* To get your user ID: right-click your own name in Discord → Copy User ID.

**Getting your Roblox cookie:**
1. Log into Roblox in Chrome/Edge
2. Press **F12** → **Application** tab → **Cookies** → `https://www.roblox.com`
3. Find `.ROBLOSECURITY`, click it, copy the **entire Value** — it starts with `_|WARNING`

### Step 5 — Invite the bot to your server

Use this URL (replace `YOUR_CLIENT_ID` with your Application ID):
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot+applications.commands&permissions=0
```

**Important:** The URL must include `applications.commands` in the scope or slash commands will never show up.

### Step 6 — Register commands (instant)
```
node deploy-guild.js
```
This registers commands directly in your server — they appear in Discord **immediately**.

### Step 7 — Start the bot
```
npm start
```

The bot must be running for commands to respond.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Commands don't show up | Run `node deploy-guild.js` and make sure the bot was invited with the URL from Step 5 |
| Commands show but nothing happens | Make sure `npm start` is running |
| "Not whitelisted" error | Use `/whitelist add @you` (only bot owner can do this) |
| Roblox auth fails | Use `/setcookie` in a DM with the bot to update the cookie |
| Cookie rejected | Make sure you copy the full value starting with `_|WARNING` |

---

## Requirements for Roblox ranking

The account whose cookie you use must:
- Be **in the group**
- Have **ranking permissions**
- **Outrank** every user they try to rank (Roblox enforces this — the bot can't bypass it)
