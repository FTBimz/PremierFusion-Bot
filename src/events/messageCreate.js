const { EmbedBuilder } = require('discord.js');
const { getTriggers } = require('../utils/triggerStore');
const { getGuildAfk, removeUserAfk } = require('../utils/afkStore');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const afkMap = getGuildAfk(guildId);

        // 1. Auto-Remove AFK Status & Restore Nickname when user speaks
        if (afkMap[message.author.id]) {
            const oldData = removeUserAfk(guildId, message.author.id);

            if (message.member && message.member.manageable) {
                const currentNick = message.member.nickname || '';
                if (currentNick.startsWith('[AFK]')) {
                    const restoredNick = oldData?.oldNickname !== undefined
                        ? oldData.oldNickname
                        : currentNick.replace(/^\[AFK\]\s*/i, '') || null;

                    await message.member.setNickname(restoredNick).catch(() => {});
                }
            }

            const backEmbed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setDescription(`👋 Welcome back ${message.author}! Your **AFK** status has been removed.`);

            await message.reply({ embeds: [backEmbed], allowedMentions: { repliedUser: false } }).catch(() => {});
        }

        // 2. Notify if mentioned user(s) are currently AFK
        if (message.mentions.users.size > 0) {
            const mentionedAfks = [];

            message.mentions.users.forEach(user => {
                if (user.id !== message.author.id && afkMap[user.id]) {
                    const info = afkMap[user.id];
                    const since = `<t:${Math.floor(info.timestamp / 1000)}:R>`;
                    mentionedAfks.push(`💤 **${user.displayName}** is currently AFK: *${info.reason}* (${since})`);
                }
            });

            if (mentionedAfks.length > 0) {
                const mentionEmbed = new EmbedBuilder()
                    .setColor('#d8b8ff')
                    .setDescription(mentionedAfks.join('\n'));

                await message.reply({ embeds: [mentionEmbed], allowedMentions: { repliedUser: false } }).catch(() => {});
            }
        }

        // 3. Custom Triggers System (Input -> Output)
        const guildTriggers = getTriggers(guildId);
        const matchedTrigger = guildTriggers.find(t => t.input.toLowerCase() === message.content.trim().toLowerCase());
        if (matchedTrigger) {
            if (matchedTrigger.type === 'reply') {
                return message.reply({ content: matchedTrigger.output });
            } else if (matchedTrigger.type === 'mention') {
                return message.channel.send({ content: `<@${message.author.id}> ${matchedTrigger.output}` });
            } else {
                return message.channel.send({ content: matchedTrigger.output });
            }
        }
    }
};