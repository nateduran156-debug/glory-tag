const { EmbedBuilder } = require("discord.js");
const noblox = require("noblox.js");
const { applyCookie } = require("../utils/cookie");

module.exports = {
  name: "setcookie",

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const ownerId = process.env.BOT_OWNER_ID;
    if (!ownerId || interaction.user.id !== ownerId) {
      return interaction.editReply("❌ Only the bot owner can use this command.");
    }

    if (interaction.guild) {
      return interaction.editReply(
        "⚠️ For security, only use `/setcookie` in a **DM with the bot** — never in a server channel.\n\nOpen a DM with the bot and try again."
      );
    }

    const cookie = interaction.options.getString("cookie").trim();

    if (!cookie.startsWith("_|WARNING")) {
      return interaction.editReply(
        "❌ That doesn't look like a valid `.ROBLOSECURITY` cookie.\n\nIt should start with `_|WARNING:-DO-NOT-SHARE-THIS...`\n\nMake sure you copy the **full** cookie value."
      );
    }

    try {
      await applyCookie(cookie);
      const me = await noblox.getCurrentUser();

      const embed = new EmbedBuilder()
        .setTitle("✅ Cookie Updated")
        .setDescription(`Logged into Roblox as **${me.UserName}** (\`${me.UserID}\`).\n\nThe new cookie has been saved — the bot will use it automatically on next restart too.`)
        .setColor(0x57f287)
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      return interaction.editReply(
        `❌ Cookie was rejected by Roblox: ${err.message}\n\nMake sure you copied the full value including the \`_|WARNING...\` prefix.`
      );
    }
  },
};
