require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");
const noblox = require("noblox.js");

const roleCommand = require("./commands/role");
const stripCommand = require("./commands/strip");
const whitelistCommand = require("./commands/whitelist");

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const ROBLOX_COOKIE = process.env.ROBLOX_COOKIE;

if (!TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN is not set in your .env file.");
  process.exit(1);
}
if (!ROBLOX_COOKIE) {
  console.error("❌ ROBLOX_COOKIE is not set in your .env file.");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

(async () => {
  try {
    await noblox.setCookie(ROBLOX_COOKIE.trim(), false);
    const me = await noblox.getCurrentUser();
    console.log(`✅ Logged into Roblox as: ${me.UserName} (${me.UserID})`);
  } catch (err) {
    console.error("⚠️  Could not verify Roblox login, continuing anyway:", err.message);
  }

  client.once(Events.ClientReady, (c) => {
    console.log(`✅ Discord bot ready as: ${c.user.tag}`);
    if (!process.env.BOT_OWNER_ID) {
      console.warn("⚠️  BOT_OWNER_ID is not set — no one can use the bot until you whitelist someone or set this.");
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
