const { EmbedBuilder } = require("discord.js");
const noblox = require("noblox.js");
const { applyCookie, saveCookie } = require("../utils/cookie");

module.exports = {
  name: "setcookie",

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const ownerId = process.env.BOT_OWNER_ID;
    if (!ownerId || interaction.user.id !== ownerId) {
      return interaction.editReply("❌ Only the bot owner can use this command.");
    }

    const cookie = interaction.options.getString("cookie").trim();

    // Save cookie to disk regardless of validation result
    saveCookie(cookie);

    // Try to apply and verify — but don't fail if verification fails
    try {
      await noblox.setCookie(cookie, false);
    } catch (err) {
      // ignore — setCookie itself shouldn't throw with validate=false
    }

    let verifiedAs = null;
    try {
      const me = await noblox.getCurrentUser();
      verifiedAs = `${me.UserName} (${me.UserID})`;
    } catch {
      // Cookie may still work for ranking even if getCurrentUser fails
    }

    const embed = new EmbedBuilder().setTimestamp();

    if (verifiedAs) {
      embed
        .setTitle("✅ Cookie Saved & Verified")
        .setDescription(`Logged into Roblox as **${verifiedAs}**.\n\nThe bot will use this cookie for all ranking actions.`)
        .setColor(0x57f287);
    } else {
      embed
        .setTitle("⚠️ Cookie Saved (Not Verified)")
        .setDescription(
          `The cookie was saved but Roblox couldn't verify it right now.\n\n` +
          `**Try using \`/role\` or \`/strip\` — it may still work.**\n\n` +
          `If ranking fails too, your cookie may be expired. Get a fresh one:\n` +
          `1. Open Chrome and log into **roblox.com**\n` +
          `2. Press **F12** → Application → Cookies → \`https://www.roblox.com\`\n` +
          `3. Find \`.ROBLOSECURITY\` and copy the **entire Value**\n` +
          `4. Run \`/setcookie\` again with the fresh value`
        )
        .setColor(0xfee75c);
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
