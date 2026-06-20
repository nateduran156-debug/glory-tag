require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN is missing from your .env file.");
  process.exit(1);
}
if (!process.env.DISCORD_CLIENT_ID) {
  console.error("❌ DISCORD_CLIENT_ID is missing from your .env file.");
  process.exit(1);
}

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

const globalCommands = commands.map((cmd) => ({
  ...cmd,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}));

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log(`Registering ${commands.length} global slash commands with User Install support...`);
    console.log(`Client ID: ${process.env.DISCORD_CLIENT_ID}`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: globalCommands }
    );

    console.log(`\n✅ Successfully registered ${data.length} commands:`);
    data.forEach((cmd) => console.log(`   /${cmd.name}`));
    console.log("\n⏳ Global commands can take up to 1 hour to show up in Discord.");
    console.log("   To test immediately, type / in any server the bot is in.");
  } catch (err) {
    console.error("\n❌ Failed to register commands:");
    console.error("   Status:", err.status);
    console.error("   Message:", err.message);
    if (err.rawError) console.error("   Details:", JSON.stringify(err.rawError, null, 2));
  }
})();
