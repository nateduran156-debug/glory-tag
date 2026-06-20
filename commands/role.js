const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const noblox = require("noblox.js");
const { isAllowed } = require("../utils/whitelist");

const GROUP_ID = parseInt(process.env.ROBLOX_GROUP_ID || "35914267");

const TAG_ROLES = [
  { name: "Red [TAG]",    rank: 250, emoji: "🔴" },
  { name: "Blue [TAG]",   rank: 251, emoji: "🔵" },
  { name: "Pink [TAG]",   rank: 252, emoji: "🩷" },
  { name: "Purple [TAG]", rank: 253, emoji: "🟣" },
];

module.exports = {
  name: "role",

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!isAllowed(interaction.user.id)) {
      return interaction.editReply("❌ You are not whitelisted to use this bot.");
    }

    const username = interaction.options.getString("username");

    let userId;
    try {
      userId = await noblox.getIdFromUsername(username);
    } catch {
      return interaction.editReply(`❌ Could not find Roblox user **${username}**. Check the spelling and try again.`);
    }

    const options = TAG_ROLES.map((r) => ({
      label: `${r.emoji}  ${r.name}`,
      description: `Rank ${r.rank}`,
      value: String(r.rank),
    }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`role_select_${userId}`)
        .setPlaceholder("Pick a tag to assign")
        .addOptions(options)
    );

    const embed = new EmbedBuilder()
      .setTitle("Select a Tag")
      .setDescription(`Choose the tag to assign to **${username}** (User ID: \`${userId}\`)`)
      .setColor(0x5865f2)
      .setFooter({ text: `Group ID: ${GROUP_ID}` });

    await interaction.editReply({ embeds: [embed], components: [row] });
  },

  async handleSelect(interaction) {
    await interaction.deferUpdate();

    const parts = interaction.customId.split("_");
    const userId = parseInt(parts[2]);
    const rank = parseInt(interaction.values[0]);

    const role = TAG_ROLES.find((r) => r.rank === rank);
    if (!role) {
      return interaction.editReply({ content: "❌ Unknown rank selected.", components: [], embeds: [] });
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
        content: `❌ Failed to set rank: ${err.message}\n\nMake sure the bot's Roblox account has ranking permissions and outranks the target user.`,
        components: [],
        embeds: [],
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("✅ Tag Assigned")
      .setDescription(`${role.emoji} **${username}** has been given the **${role.name}** tag (Rank ${rank})`)
      .setColor(
        rank === 250 ? 0xe74c3c :
        rank === 251 ? 0x3498db :
        rank === 252 ? 0xff69b4 :
        0x9b59b6
      )
      .setFooter({ text: `Group ID: ${GROUP_ID} • Done by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], components: [] });
  },
};
