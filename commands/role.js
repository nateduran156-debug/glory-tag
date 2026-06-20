const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags,
} = require("discord.js");
const noblox = require("noblox.js");
const { isAllowed } = require("../utils/whitelist");

const GROUP_ID = parseInt(process.env.ROBLOX_GROUP_ID || "35914267");

const TAG_ROLES = [
  { name: "Red [TAG]",    rank: 250, color: 0xe74c3c },
  { name: "Blue [TAG]",   rank: 251, color: 0x3498db },
  { name: "Pink [TAG]",   rank: 252, color: 0xe91e8c },
  { name: "Purple [TAG]", rank: 253, color: 0x9b59b6 },
];

module.exports = {
  name: "role",

  async execute(interaction) {
    await interaction.deferReply();

    if (!isAllowed(interaction.user.id)) {
      return interaction.editReply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("You are not whitelisted.")
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const username = interaction.options.getString("username");

    let userId;
    try {
      userId = await noblox.getIdFromUsername(username);
    } catch {
      return interaction.editReply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`User not found: **${username}**`)
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`role_select_${userId}`)
      .setPlaceholder("Select a rank")
      .addOptions(
        TAG_ROLES.map((r) => ({
          label: r.name,
          description: `Rank ${r.rank}`,
          value: String(r.rank),
        }))
      );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${username}** — \`${userId}\`\nAssign a rank:`)
      )
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
      .addActionRowComponents(new ActionRowBuilder().addComponents(selectMenu));

    return interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },

  async handleSelect(interaction) {
    await interaction.deferUpdate();

    const parts = interaction.customId.split("_");
    const userId = parseInt(parts[2]);
    const rank = parseInt(interaction.values[0]);

    const role = TAG_ROLES.find((r) => r.rank === rank);
    if (!role) {
      return interaction.editReply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent("Unknown rank.")
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    let username;
    try {
      username = await noblox.getUsernameFromId(userId);
    } catch {
      username = String(userId);
    }

    try {
      await noblox.setRank(GROUP_ID, userId, rank);
    } catch (err) {
      return interaction.editReply({
        components: [
          new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `Failed to set rank.\n\`${err.message}\`\n\nMake sure the bot account has ranking permissions and outranks the target user.`
            )
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    const container = new ContainerBuilder()
      .setAccentColor(role.color)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${username}** — ${role.name}\nRanked by ${interaction.user.username}`
        )
      );

    return interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
