const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    ComponentType
} = require('discord.js');
const { getGuildAfk, setUserAfk, clearGuildAfk } = require('../../utils/afkStore');

const ITEMS_PER_PAGE = 10;

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Server AFK management system')
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set your AFK status in this server')
                .addStringOption(opt =>
                    opt.setName('reason')
                        .setDescription('Reason for going AFK (optional)')
                        .setMaxLength(200)
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('View all currently AFK members in this server')
        )
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('[Moderator] Clear all AFK statuses and reset nicknames in this server')
        ),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({ content: '<:red_tick:1552640233164771338> This command can only be used inside a server.', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        // --- SUBCOMMAND: SET ---
        if (sub === 'set') {
            const reason = interaction.options.getString('reason') || 'No reason provided';
            const member = interaction.member;
            const currentNick = member.nickname || interaction.user.displayName;
            const cleanOldNick = currentNick.replace(/^\[AFK\]\s*/i, '');

            setUserAfk(guildId, interaction.user.id, {
                reason,
                timestamp: Date.now(),
                oldNickname: member.nickname // null jika sebelumnya tidak memakai nickname khusus
            });

            // Ubah nickname menjadi [AFK] Nama (jika hierarki role bot mengizinkan)
            const newNick = `[AFK] ${cleanOldNick}`.slice(0, 32);
            if (member.manageable && !currentNick.startsWith('[AFK]')) {
                await member.setNickname(newNick).catch(() => {});
            }

            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle('💤 AFK Status Set')
                .setDescription(`${interaction.user} is now marked as **AFK**.\n**Reason:** ${reason}`)
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                allowedMentions: { parse: [] }
            });
        }

        // --- SUBCOMMAND: LIST (UNLIMITED, 10 PER PAGE WITH ARROWS) ---
        if (sub === 'list') {
            const afkMap = getGuildAfk(guildId);
            const entries = Object.entries(afkMap);

            if (entries.length === 0) {
                return interaction.reply({
                    content: 'ℹ️ There are currently no AFK members in this server.',
                    ephemeral: true
                });
            }

            let currentPage = 0;
            const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);

            const generateEmbed = (page) => {
                const start = page * ITEMS_PER_PAGE;
                const slice = entries.slice(start, start + ITEMS_PER_PAGE);

                const descriptionList = slice.map(([userId, data], idx) => {
                    const relativeTime = `<t:${Math.floor(data.timestamp / 1000)}:R>`;
                    return `**${start + idx + 1}.** <@${userId}> — *${data.reason}* (${relativeTime})`;
                }).join('\n');

                return new EmbedBuilder()
                    .setColor('#d8b8ff')
                    .setTitle(`💤 AFK Members - ${interaction.guild.name}`)
                    .setDescription(descriptionList)
                    .setFooter({
                        text: `Page ${page + 1} of ${totalPages} • Total AFK: ${entries.length} member(s)`
                    })
                    .setTimestamp();
            };

            const generateButtons = (page, disabled = false) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('afk_prev')
                        .setEmoji('◀️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(disabled || page === 0),
                    new ButtonBuilder()
                        .setCustomId('afk_next')
                        .setEmoji('▶️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(disabled || page >= totalPages - 1)
                );
            };

            const message = await interaction.reply({
                embeds: [generateEmbed(currentPage)],
                components: totalPages > 1 ? [generateButtons(currentPage)] : [],
                allowedMentions: { parse: [] },
                fetchReply: true
            });

            if (totalPages <= 1) return;

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000
            });

            collector.on('collect', async (btnInteraction) => {
                if (btnInteraction.user.id !== interaction.user.id) {
                    return btnInteraction.reply({
                        content: '<:red_tick:1552640233164771338> Only the command user can navigate these pages.',
                        ephemeral: true
                    });
                }

                if (btnInteraction.customId === 'afk_prev' && currentPage > 0) {
                    currentPage--;
                } else if (btnInteraction.customId === 'afk_next' && currentPage < totalPages - 1) {
                    currentPage++;
                }

                await btnInteraction.update({
                    embeds: [generateEmbed(currentPage)],
                    components: [generateButtons(currentPage)],
                    allowedMentions: { parse: [] }
                });
            });

            collector.on('end', async () => {
                await interaction.editReply({
                    components: [generateButtons(currentPage, true)]
                }).catch(() => {});
            });
        }

        // --- SUBCOMMAND: CLEAR (MODERATOR ONLY) ---
        if (sub === 'clear') {
            const hasPerm = interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)
                || interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers);

            if (!hasPerm) {
                return interaction.reply({
                    content: '<:red_tick:1552640233164771338> **Permission Denied**: You need `Manage Nicknames` or `Moderate Members` permission to use this command.',
                    ephemeral: true
                });
            }

            await interaction.deferReply({ ephemeral: true });

            const clearedEntries = clearGuildAfk(guildId);
            const userIds = Object.keys(clearedEntries);

            if (userIds.length === 0) {
                return interaction.editReply({
                    content: 'ℹ️ There are no AFK members to clear in this server.'
                });
            }

            let resetCount = 0;

            for (const userId of userIds) {
                const info = clearedEntries[userId];
                const member = await interaction.guild.members.fetch(userId).catch(() => null);

                if (member && member.manageable) {
                    const currentNick = member.nickname || '';
                    if (currentNick.startsWith('[AFK]') || info.oldNickname !== undefined) {
                        const restoredNick = info.oldNickname !== undefined
                            ? info.oldNickname
                            : currentNick.replace(/^\[AFK\]\s*/i, '') || null;

                        await member.setNickname(restoredNick).then(() => {
                            resetCount++;
                        }).catch(() => {});
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle('🧹 AFK List Cleared')
                .setDescription(
                    `Successfully cleared **${userIds.length}** AFK member(s) from this server.\n` +
                    `Nicknames restored: **${resetCount}** member(s).`
                )
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }
    }
};