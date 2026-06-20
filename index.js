require("dotenv").config();
const { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } = require("discord.js");
const noblox = require("noblox.js");

const roleCommand = require("./commands/role");
const stripCommand = require("./commands/strip");
const whitelistCommand = require("./commands/whitelist");
const setcookieCommand = require("./commands/setcookie");
const { loadCookie, applyCookie } = require("./utils/cookie");

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

if (!TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN is not set in your .env file.");
  process.exit(1);
}
if (!CLIENT_ID) {
  console.error("❌ DISCORD_CLIENT_ID is not set in your .env file.");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("role")
    .setDescription("Set a Roblox group rank for a user")
    .setDMPermission(true)
    .addStringOption((opt) =>
      opt.setName("username").setDescription("Roblox username to rank").setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("strip")
    .setDescription("Remove Roblox group rank from a user or everyone")
    .setDMPermission(true)
    .addStringOption((opt) =>
      opt
        .setName("target")
        .setDescription('Roblox username or "everyone confirm" to strip all members')
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Manage who can use the bot")
    .setDMPermission(true)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Allow a user to use /role and /strip")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Discord user to whitelist").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove a user's access to /role and /strip")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Discord user to remove").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("Show all whitelisted users")
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("setcookie")
    .setDescription("Update the Roblox cookie (bot owner only — use in DMs)")
    .setDMPermission(true)
    .addStringOption((opt) =>
      opt
        .setName("cookie")
        .setDescription("Your full .ROBLOSECURITY cookie value")
        .setRequired(true)
    )
    .toJSON(),
];

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const guildId = process.env.DISCORD_GUILD_ID;

  try {
    if (guildId) {
      // Guild registration = instant
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: commands });
      console.log(`✅ Slash commands registered instantly in guild ${guildId}`);
    } else {
      // Global registration = up to 1 hour
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log("✅ Slash commands registered globally (may take up to 1 hour to appear)");
      console.log("   Tip: Add DISCORD_GUILD_ID to your .env for instant registration.");
    }
  } catch (err) {
    console.error("❌ Failed to register slash commands:", err.message);
    if (err.rawError) console.error("   Details:", JSON.stringify(err.rawError));
  }
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

(async () => {
  // Load Roblox cookie
  const cookie = loadCookie();
  if (!cookie) {
    console.warn("⚠️  No Roblox cookie set. DM the bot and use /setcookie to add one.");
  } else {
    try {
      await applyCookie(cookie);
      const me = await noblox.getCurrentUser();
      console.log(`✅ Logged into Roblox as: ${me.UserName} (${me.UserID})`);
    } catch (err) {
      console.warn("⚠️  Could not verify Roblox login, continuing anyway:", err.message);
      console.warn("   DM the bot and use /setcookie to update the cookie.");
    }
  }

  // Auto-register commands on startup
  await registerCommands();

  client.once(Events.ClientReady, (c) => {
    console.log(`✅ Discord bot ready as: ${c.user.tag}`);
    if (!process.env.BOT_OWNER_ID) {
      console.warn("⚠️  BOT_OWNER_ID not set — add your Discord user ID to .env");
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
