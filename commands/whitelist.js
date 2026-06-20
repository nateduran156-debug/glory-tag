const { EmbedBuilder } = require("discord.js");
const wl = require("../utils/whitelist");

module.exports = {
  name: "whitelist",

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!wl.isAllowed(interaction.user.id)) {
      return interaction.editReply("❌ You don't have permission to manage the whitelist.");
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "add") {
      const user = interaction.options.getUser("user");
      const added = wl.add(user.id);
      const embed = new EmbedBuilder()
        .setColor(added ? 0x57f287 : 0xfee75c)
        .setDescription(
          added
            ? `✅ **${user.tag}** has been added to the whitelist and can now use /role and /strip.`
            : `⚠️ **${user.tag}** is already on the whitelist.`
        );
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === "remove") {
      const user = interaction.options.getUser("user");
      if (user.id === process.env.BOT_OWNER_ID) {
        return interaction.editReply("❌ You cannot remove the bot owner from the whitelist.");
      }
      const removed = wl.remove(user.id);
      const embed = new EmbedBuilder()
        .setColor(removed ? 0xed4245 : 0xfee75c)
        .setDescription(
          removed
            ? `✅ **${user.tag}** has been removed from the whitelist.`
            : `⚠️ **${user.tag}** was not on the whitelist.`
        );
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === "list") {
      const ids = wl.getAll();
      const ownerId = process.env.BOT_OWNER_ID;

      const lines = ids.map((id) => `<@${id}>${id === ownerId ? " 👑" : ""}`);
      if (ownerId && !ids.includes(ownerId)) {
        lines.unshift(`<@${ownerId}> 👑 *(owner — always allowed)*`);
      }

      const embed = new EmbedBuilder()
        .setTitle("Whitelist")
        .setColor(0x5865f2)
        .setDescription(
          lines.length > 0
            ? lines.join("\n")
            : "No users whitelisted yet. Use `/whitelist add` to add someone."
        )
        .setFooter({ text: `${ids.length} whitelisted user(s)` });
      return interaction.editReply({ embeds: [embed] });
    }
  },
};
