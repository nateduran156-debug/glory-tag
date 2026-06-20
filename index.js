require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");
const noblox = require("noblox.js");

const roleCommand = require("./commands/role");
const stripCommand = require("./commands/strip");
const whitelistCommand = require("./commands/whitelist");
const setcookieCommand = require("./commands/setcookie");
const { loadCookie, applyCookie } = require("./utils/cookie");

const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN is not set in your .env file.");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

(async () => {
  const cookie = loadCookie();

  if (!cookie) {
    console.warn("⚠️  No Roblox cookie found. Use /setcookie in a DM with the bot to set one.");
  } else {
    try {
      await applyCookie(cookie);
      const me = await noblox.getCurrentUser();
      console.log(`✅ Logged into Roblox as: ${me.UserName} (${me.UserID})`);
    } catch (err) {
      console.error("⚠️  Could not verify Roblox login, continuing anyway:", err.message);
      console.error("   Use /setcookie in a DM with the bot to update the cookie.");
    }
  }

  client.once(Events.ClientReady, (c) => {
    console.log(`✅ Discord bot ready as: ${c.user.tag}`);
    if (!process.env.BOT_OWNER_ID) {
      console.warn("⚠️  BOT_OWNER_ID is not set — set it in .env to your Discord user ID.");
    }
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "role") {
          await roleCommand.execute(interaction);
        } else if (interaction.commandName === "strip") {
          await stripCommand.execute(interaction);
        } else if (interaction.commandName === "whitelist") {
          await whitelistCommand.execute(interaction);
        } else if (interaction.commandName === "setcookie") {
          await setcookieCommand.execute(interaction);
        }
      } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith("role_select_")) {
          await roleCommand.handleSelect(interaction);
        }
      }
    } catch (err) {
      console.error("Interaction error:", err);
      const reply = { content: `❌ An error occurred: ${err.message}`, ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  });

  client.login(TOKEN);
})();
