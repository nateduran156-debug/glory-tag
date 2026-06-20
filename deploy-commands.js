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
        .setDescription('Roblox username or "everyone" to strip all members')
        .setRequired(true)
    )
    .toJSON(),
];

// Enable commands in: servers (0), bot DMs (1), and DMs between users (2)
const contexts = [0, 1, 2];
// Available as both a server install and a user install
const integrationTypes = [0, 1];

const commandsWithContexts = commands.map((cmd) => ({
  ...cmd,
  contexts,
  integration_types: integrationTypes,
}));

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("Registering global slash commands (servers + DMs + user installs)...");
    await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
      body: commandsWithContexts,
    });
    console.log("✅ Global slash commands registered!");
    console.log("   Works in: servers, bot DMs, and DMs/group chats between users.");
    console.log("   Note: May take up to 1 hour to propagate globally.");
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
})();
