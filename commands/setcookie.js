const {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const noblox = require("noblox.js");
const { applyCookie, saveCookie } = require("../utils/cookie");

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

    saveCookie(cookie);

    try {
      await noblox.setCookie(cookie, false);
    } catch {
      // ignore
    }

    let verifiedAs = null;
    try {
      const me = await noblox.getCurrentUser();
      verifiedAs = `${me.UserName} (${me.UserID})`;
    } catch {
      // continue
    }

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
      cv2(
        "Cookie saved. Roblox could not verify the session — test with `/role` to confirm it works.\n\nIf it fails, get a fresh cookie from your browser and try again."
      )
    );
  },
};
