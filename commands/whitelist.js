const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const wl = require("../utils/whitelist");

function cv2(text) {
  return {
    components: [
      new ContainerBuilder().addTextDisplayComponents(
        new TextDisplayBuilder().setContent(text)
      ),
    ],
    flags: MessageFlags.IsComponentsV2,
  };
}

module.exports = {
  name: "whitelist",

  async execute(interaction) {
    await interaction.deferReply();

    if (!wl.isAllowed(interaction.user.id)) {
      return interaction.editReply(cv2("You are not whitelisted."));
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "add") {
      const user = interaction.options.getUser("user");
      const added = wl.add(user.id);
      return interaction.editReply(
        cv2(added ? `${user.username} added.` : `${user.username} is already whitelisted.`)
      );
    }

    if (sub === "remove") {
      const user = interaction.options.getUser("user");
      if (user.id === process.env.BOT_OWNER_ID) {
        return interaction.editReply(cv2("Cannot remove the bot owner."));
      }
      const removed = wl.remove(user.id);
      return interaction.editReply(
        cv2(removed ? `${user.username} removed.` : `${user.username} was not on the whitelist.`)
      );
    }

    if (sub === "list") {
      const ids = wl.getAll();
      const ownerId = process.env.BOT_OWNER_ID;

      const lines = [];
      if (ownerId && !ids.includes(ownerId)) {
        lines.push(`<@${ownerId}> — owner`);
      }
      for (const id of ids) {
        lines.push(`<@${id}>${id === ownerId ? " — owner" : ""}`);
      }

      const body = lines.length > 0 ? lines.join("\n") : "No users whitelisted.";

      return interaction.editReply({
        components: [
          new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`**Whitelist** (${ids.length})\n${body}`)
            ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};
