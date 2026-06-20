const { EmbedBuilder } = require("discord.js");
const noblox = require("noblox.js");

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

module.exports = {
  name: "strip",

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getString("target").trim();

    if (target.toLowerCase() === "everyone") {
      const confirmEmbed = new EmbedBuilder()
        .setTitle("⚠️ Strip Everyone")
        .setDescription(
          `You are about to **exile every member** from group **${GROUP_ID}**.\n\nThis action cannot be undone. Reply with the command again adding \`confirm\` if you are certain, or this was already confirmed.`
        )
        .setColor(0xfee75c);

      const alreadyConfirmed = interaction.options.getString("target").includes("everyone confirm");

      if (!alreadyConfirmed) {
        return interaction.editReply({
          content: "⚠️ To strip **everyone**, use `/strip target:everyone confirm` to confirm.",
          embeds: [],
        });
      }

      let members;
      try {
        members = await getAllGroupMembers();
      } catch (err) {
        return interaction.editReply(`❌ Failed to fetch group members: ${err.message}`);
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

      const embed = new EmbedBuilder()
        .setTitle("✅ Strip Everyone Complete")
        .setDescription(`Exiled **${success}** members. Failed: **${failed}**.`)
        .setColor(0x57f287)
        .setFooter({ text: `Group ID: ${GROUP_ID} • Done by ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    const username = target.replace("everyone confirm", "").trim() || target;

    let userId;
    try {
      userId = await noblox.getIdFromUsername(username);
    } catch {
      return interaction.editReply(`❌ Could not find Roblox user **${username}**.`);
    }

    try {
      await stripUser(userId);
    } catch (err) {
      return interaction.editReply(
        `❌ Failed to exile **${username}**: ${err.message}\n\nMake sure the bot's Roblox account has exile permissions in the group.`
      );
    }

    const embed = new EmbedBuilder()
      .setTitle("✅ User Exiled / Stripped")
      .setDescription(`**${username}** has been exiled from the group.`)
      .setColor(0xed4245)
      .setFooter({ text: `Group ID: ${GROUP_ID} • Done by ${interaction.user.tag}` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
