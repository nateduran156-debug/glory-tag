# Roblox Discord Bot

Discord bot for ranking users in Roblox group **35914267**.

## Commands

- `/role username` — Shows the 4 tag ranks as a dropdown. Pick one to assign it to the user.
  - 🔴 Red [TAG] — Rank 250
  - 🔵 Blue [TAG] — Rank 251
  - 🩷 Pink [TAG] — Rank 252
  - 🟣 Purple [TAG] — Rank 253
- `/strip target` — Exiles (removes) a user from the group. Use `everyone confirm` to exile all members.

Commands work **everywhere**: servers, bot DMs, and DMs between users.

## Setup

### 1. Install Node.js
Download from https://nodejs.org (v18 or higher recommended)

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
Copy `.env.example` to `.env` and fill in your values:
```
DISCORD_BOT_TOKEN=      ← From Discord Developer Portal → Bot → Token
DISCORD_CLIENT_ID=      ← From Discord Developer Portal → General Information → Application ID
ROBLOX_COOKIE=          ← .ROBLOSECURITY cookie from your ranking Roblox account
ROBLOX_GROUP_ID=35914267
```

**Getting your Roblox cookie:**
1. Log into Roblox in your browser with the ranking account
2. Open DevTools (F12) → Application tab → Cookies → `www.roblox.com`
3. Copy the value of `.ROBLOSECURITY`

### 4. Create your Discord bot & enable User Install

1. Go to https://discord.com/developers/applications
2. Create a new application
3. **Bot tab** → click "Add Bot", then copy the Token → paste as `DISCORD_BOT_TOKEN`
4. **General Information tab** → copy the Application ID → paste as `DISCORD_CLIENT_ID`
5. **Installation tab** (important for DMs between users):
   - Under **Installation Contexts**, enable both **Guild Install** and **User Install**
   - Under **Default Install Settings → User Install**, add the `applications.commands` scope
   - Save changes
6. **OAuth2 → URL Generator** → select scopes: `bot` + `applications.commands` → invite the bot to your server with the generated link

### 5. Register slash commands (run once)
```bash
npm run deploy
```
Global commands take up to **1 hour** to appear everywhere.

### 6. Run the bot
```bash
npm start
```

### 7. Let users install it personally (for DMs)
After enabling User Install in the portal, share this link so people can add it to their own account:
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=applications.commands
```
Replace `YOUR_CLIENT_ID` with your Application ID. Once installed on their account, the commands work in any DM or group chat they're in.

## Requirements

- The Roblox account used for `ROBLOX_COOKIE` must:
  - Be in the group
  - Have **ranking permissions** (can change member ranks)
  - **Outrank** any user they are trying to rank (Roblox restriction)

## Notes

- Replies are ephemeral (only visible to the person who ran the command)
- The `/strip everyone confirm` command exiles members one by one with a small delay to avoid Roblox rate limits
