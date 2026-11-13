const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a custom text message to current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(opt =>
            opt.setName('message')
               .setDescription('Send a custom text message to current channel')
               .setRequired(true)
        )
        .addBooleanOption(opt =>
            opt.setName('silent')
               .setDescription('Send without push notifications (Yes/No)')
               .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const messageContent = interaction.options.getString('message');
        const isSilent = interaction.options.getBoolean('silent') || false;

        const payload = {
            content: messageContent,
            // Blokir semua parsing tag (@everyone, @here, role, dan user mention)
            allowedMentions: { parse: [] }
        };

        // Aktifkan silent flag jika opsi silent diisi True
        if (isSilent) {
            payload.flags = [MessageFlags.SuppressNotifications];
        }

        try {
            await interaction.channel.send(payload);
            await interaction.editReply({
                content: `<:green_tick:1552640231239323668> **Message sent to ${interaction.channel}${isSilent ? ' (Silent Mode)' : ''}.**`
            });
        } catch (error) {
            console.error('Send Error:', error.message);
            await interaction.editReply({
                content: '<:red_tick:1552640233164771338> **Failed to send message**: Please check bot permissions in this channel.'
            });
        }
    }
};