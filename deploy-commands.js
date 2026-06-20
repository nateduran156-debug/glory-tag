require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("role")
    .setDescription("Set a Roblox group rank for a user")
    .setDMPermission(true)
    .addStringOption((opt) =>
      opt
        .setName("username")
        .setDescription("Roblox username to rank")
        .setRequired(true)
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
];

const contexts = [0, 1, 2];
const integrationTypes = [0, 1];

const commandsWithContexts = commands.map((cmd) => ({
  ...cmd,
  contexts,
  integration_types: integrationTypes,
}));

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("Registering global slash commands...");
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
      body: commandsWithContexts,
    });
    console.log("✅ Global slash commands registered!");
    console.log("   Commands: /role, /strip, /whitelist");
    console.log("   Works in: servers, bot DMs, and DMs between users.");
    console.log("   Note: May take up to 1 hour to propagate globally.");
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
})();
