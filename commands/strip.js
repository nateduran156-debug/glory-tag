const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const noblox = require("noblox.js");
const { isAllowed } = require("../utils/whitelist");

const GROUP_ID = parseInt(process.env.ROBLOX_GROUP_ID || "35914267");

async function stripUser(userId) {
  await noblox.exile(GROUP_ID, userId);
}

async function getAllGroupMembers() {
  const members = [];
  let cursor = "";
  do {
    const page = await noblox.getPlayers(GROUP_ID, cursor);
    members.push(...page.playerIds);
    cursor = page.nextPageCursor || "";
  } while (cursor);
  return members;
}

function cv2Error(text) {
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
  name: "strip",

  async execute(interaction) {
    await interaction.deferReply();

    if (!isAllowed(interaction.user.id)) {
      return interaction.editReply(cv2Error("You are not whitelisted."));
    }

    const target = interaction.options.getString("target").trim();

    if (target.toLowerCase() === "everyone confirm") {
      let members;
      try {
        members = await getAllGroupMembers();
      } catch (err) {
        return interaction.editReply(cv2Error(`Could not fetch group members.\n\`${err.message}\``));
      }

      let success = 0;
      let failed = 0;
      for (const uid of members) {
        try {
          await stripUser(uid);
          success++;
        } catch {
          failed++;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      return interaction.editReply({
        components: [
          new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `Strip complete.\n${success} exiled — ${failed} failed.`
              )
            ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    if (target.toLowerCase() === "everyone") {
      return interaction.editReply({
        components: [
          new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                "To strip everyone, use `/strip target:everyone confirm`"
              )
            ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    let userId;
    try {
      userId = await noblox.getIdFromUsername(target);
    } catch {
      return interaction.editReply(cv2Error(`User not found: **${target}**`));
    }

    try {
      await stripUser(userId);
    } catch (err) {
      return interaction.editReply(
        cv2Error(`Failed to exile **${target}**.\n\`${err.message}\``)
      );
    }

    return interaction.editReply({
      components: [
        new ContainerBuilder()
          .setAccentColor(0xed4245)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${target}** exiled.\nDone by ${interaction.user.username}`
            )
          ),
      ],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
