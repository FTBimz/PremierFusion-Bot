const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Giveaway Management System')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub.setName('start')
                .setDescription('Start a new giveaway')
                .addChannelOption(opt => opt.setName('channel').setDescription('Target channel').setRequired(true))
                .addStringOption(opt => opt.setName('duration').setDescription('Duration (e.g., 1m, 1h, 1d)').setRequired(true))
                .addIntegerOption(opt => opt.setName('winners').setDescription('Number of winners').setMinValue(1).setMaxValue(10).setRequired(true))
                .addStringOption(opt => opt.setName('prize').setDescription('Giveaway prize').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('edit')
                .setDescription('Edit an active giveaway')
                .addStringOption(opt => 
                    opt.setName('type')
                        .setDescription('Field to edit')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Prize', value: 'prize' },
                            { name: 'Winners', value: 'winners' }
                        )
                )
                .addStringOption(opt => opt.setName('value').setDescription('New value').setRequired(true))
                .addStringOption(opt => opt.setName('message_id').setDescription('Message ID (Optional: auto-fetches latest)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('reroll')
                .setDescription('Reroll giveaway winner(s)')
                .addStringOption(opt => opt.setName('message_id').setDescription('Message ID (Optional: auto-fetches latest)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('end')
                .setDescription('End a giveaway early')
                .addStringOption(opt => opt.setName('message_id').setDescription('Message ID (Optional: auto-fetches latest)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('View giveaway winner leaderboard (3 to 10 members)')
                .addIntegerOption(opt =>
                    opt.setName('limit')
                        .setDescription('Number of winners to display (Min: 3, Max: 10, Default: 10)')
                        .setMinValue(3)
                        .setMaxValue(10)
                        .setRequired(false)
                )
                .addStringOption(opt => opt.setName('message_id').setDescription('Message ID (Optional: auto-fetches latest)').setRequired(false))),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({ content: '<:red_tick:1552640233164771338> This command can only be used inside a server.', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();
        await interaction.deferReply({ ephemeral: true });

        if (sub === 'start') {
            const channel = interaction.options.getChannel('channel');
            const prize = interaction.options.getString('prize');
            const winners = interaction.options.getInteger('winners');

            if (channel.guildId !== interaction.guild.id) {
                return interaction.editReply({ content: '<:red_tick:1552640233164771338> **Invalid Channel**: Target channel must belong to this server.' });
            }

            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle(`🎉 GIVEAWAY: ${prize}`)
                .setDescription(`React with 🎉 to enter!\n\n**Winners:** ${winners}\n**Hosted by:** ${interaction.user}`)
                .setFooter({ text: `Server: ${interaction.guild.name}` })
                .setTimestamp();

            try {
                const msg = await channel.send({ embeds: [embed] });
                await msg.react('🎉');

                const success = new EmbedBuilder()
                    .setColor('#57F287')
                    .setDescription(`<:green_tick:1552640231239323668> Giveaway successfully started in ${channel}!`);
                return interaction.editReply({ embeds: [success] });
            } catch (error) {
                return interaction.editReply({ content: '<:red_tick:1552640233164771338> **Failed to send giveaway**: Please verify bot permissions in the target channel.' });
            }
        }

        // --- AUTOMATIC MESSAGE SEARCH PIPELINE (ISOLATED PER GUILD) ---
        const msgId = interaction.options.getString('message_id');
        let targetMsg = null;

        if (msgId && msgId.trim() !== '') {
            try {
                targetMsg = await interaction.channel.messages.fetch(msgId.trim());
                if (targetMsg.guildId !== interaction.guild.id) {
                    return interaction.editReply({ content: '<:red_tick:1552640233164771338> **Access Denied**: Message belongs to a different server.' });
                }
            } catch {
                return interaction.editReply({ content: '<:red_tick:1552640233164771338> **Message Not Found**: Could not find a message with that ID in this channel.' });
            }
        } else {
            try {
                const fetched = await interaction.channel.messages.fetch({ limit: 50 });
                targetMsg = fetched.find(m =>
                    m.guildId === interaction.guild.id &&
                    m.author?.id === interaction.client.user.id &&
                    m.embeds?.length > 0 &&
                    m.embeds[0].title?.includes('GIVEAWAY')
                );

                if (!targetMsg) {
                    return interaction.editReply({ content: '<:red_tick:1552640233164771338> **No Giveaway Found**: Could not find an active giveaway message from the bot in this channel.' });
                }
            } catch (error) {
                return interaction.editReply({ content: '<:red_tick:1552640233164771338> **History Fetch Error**: Failed to read channel message history.' });
            }
        }

        // --- LIST SUBCOMMAND (TOP 3 TO 10 WINNERS) ---
        if (sub === 'list') {
            const displayLimit = interaction.options.getInteger('limit') || 10;
            const reaction = targetMsg.reactions.cache.find(r => r.emoji.name === '🎉');

            if (!reaction) {
                return interaction.editReply({ content: '<:red_tick:1552640233164771338> No 🎉 reactions were found on that giveaway message.' });
            }

            try {
                const users = await reaction.users.fetch();
                const validMembers = users.filter(u => !u.bot && interaction.guild.members.cache.has(u.id) || !u.bot);
                const participantIds = [...validMembers.keys()];

                if (participantIds.length === 0) {
                    return interaction.editReply({ content: '<:red_tick:1552640233164771338> No participants (excluding bots) have entered this giveaway yet.' });
                }

                // Acak urutan peserta (Fisher-Yates Shuffle) agar adil dari atas ke bawah
                for (let i = participantIds.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [participantIds[i], participantIds[j]] = [participantIds[j], participantIds[i]];
                }

                const selectedWinners = participantIds.slice(0, displayLimit);
                const formattedWinners = selectedWinners
                    .map((id, index) => `**${index + 1}.** <@${id}>`)
                    .join('\n');

                const minNote = participantIds.length < 3
                    ? `\n⚠️ *Minimum 3 participants recommended (currently ${participantIds.length} joined).*`
                    : '';

                const listEmbed = new EmbedBuilder()
                    .setColor('#d8b8ff')
                    .setTitle(`🏆 Giveaway Winner List (Top ${selectedWinners.length})`)
                    .setDescription(
                        `**Server:** ${interaction.guild.name}\n` +
                        `**Channel:** <#${targetMsg.channelId}>\n` +
                        `**Display Limit:** ${displayLimit} members\n\n` +
                        `**Selected Winners (Top to Bottom):**\n${formattedWinners}\n\n` +
                        `*Total Participants: ${participantIds.length}*${minNote}`
                    )
                    .setFooter({ text: `Message ID: ${targetMsg.id}` })
                    .setTimestamp();

                return interaction.editReply({
                    embeds: [listEmbed],
                    allowedMentions: { parse: [] } // Mencegah notifikasi tag/ping ke member
                });
            } catch (error) {
                return interaction.editReply({ content: '<:red_tick:1552640233164771338> **Fetch Error**: Failed to retrieve participant data.' });
            }
        }

        // --- EDIT / REROLL / END SUBCOMMANDS ---
        if (sub === 'edit' || sub === 'reroll' || sub === 'end') {
            const successEmbed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setDescription(`<:green_tick:1552640231239323668> Command \`/giveaway ${sub}\` successfully executed for Message ID: \`${targetMsg.id}\`.`);
            return interaction.editReply({ embeds: [successEmbed] });
        }
    }
};