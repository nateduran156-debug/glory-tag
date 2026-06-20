const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const noblox = require("noblox.js");
const { applyCookie } = require("../utils/cookie");

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
  name: "setcookie",

  async execute(interaction) {
    await interaction.deferReply();

    const ownerId = process.env.BOT_OWNER_ID;
    if (!ownerId || interaction.user.id !== ownerId) {
      return interaction.editReply(cv2("Only the bot owner can use this command."));
    }

    if (interaction.guild) {
      return interaction.editReply(
        cv2("Use this command in a DM with the bot, not in a server.")
      );
    }

    const cookie = interaction.options.getString("cookie").trim();

    let me;
    try {
      me = await applyCookie(cookie);
    } catch (err) {
      return interaction.editReply(
        cv2(`Cookie rejected by Roblox.\n\`${err.message}\`\n\nThe cookie was set in the bot's session but could not be verified. Try using \`/strip\` or \`/role\` — if those work, the cookie is fine. If not, grab a fresh one from your browser.`)
      );
    }

    const verifiedAs = me ? `${me.UserName} (${me.UserID})` : null;

    if (verifiedAs) {
      return interaction.editReply({
        components: [
          new ContainerBuilder()
            .setAccentColor(0x23a55a)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`Cookie active — logged in as **${verifiedAs}**`)
            ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    return interaction.editReply(
      cv2("Cookie saved. Could not confirm the session — test with `/strip` or `/role` to verify it works.")
    );
  },
};
