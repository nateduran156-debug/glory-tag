// Use this to register commands INSTANTLY in one specific server.
// Much faster than deploy-commands.js (global takes up to 1 hour).
// Run: node deploy-guild.js
require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN is missing from .env");
  process.exit(1);
}
if (!process.env.DISCORD_CLIENT_ID) {
  console.error("❌ DISCORD_CLIENT_ID is missing from .env");
  process.exit(1);
}
if (!process.env.DISCORD_GUILD_ID) {
  console.error("❌ DISCORD_GUILD_ID is missing from .env");
  console.error("   Right-click your server name in Discord → Copy Server ID");
  console.error("   (Enable Developer Mode first: Settings → Advanced → Developer Mode)");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder()
    .setName("role")
    .setDescription("Set a Roblox group rank for a user")
    .addStringOption((opt) =>
      opt.setName("username").setDescription("Roblox username to rank").setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("strip")
    .setDescription("Remove Roblox group rank from a user or everyone")
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
    .addStringOption((opt) =>
      opt
        .setName("cookie")
        .setDescription("Your full .ROBLOSECURITY cookie value")
        .setRequired(true)
    )
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log(`Registering ${commands.length} commands in guild ${process.env.DISCORD_GUILD_ID}...`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands }
    );

    console.log(`\n✅ Commands registered instantly in your server:`);
    data.forEach((cmd) => console.log(`   /${cmd.name}`));
    console.log("\nType / in your Discord server — they should appear right now.");
  } catch (err) {
    console.error("\n❌ Failed to register commands:");
    console.error("   Status:", err.status);
    console.error("   Message:", err.message);
    if (err.rawError) console.error("   Details:", JSON.stringify(err.rawError, null, 2));
  }
})();
