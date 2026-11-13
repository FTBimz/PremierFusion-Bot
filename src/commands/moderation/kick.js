const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('target').setDescription('Member to kick').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for kick')),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!target) return interaction.reply({ content: '<:red_tick:1552640233164771338> **Error**: Member not found in this server.', ephemeral: true });
        if (!target.kickable) return interaction.reply({ content: '<:red_tick:1552640233164771338> **Permission Error**: Cannot kick this user due to role hierarchy.', ephemeral: true });

        await target.kick(reason);
        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle('🚪 Member Kicked')
            .addFields(
                { name: 'User', value: `${target.user.tag} (${target.id})` },
                { name: 'Reason', value: reason },
                { name: 'Moderator', value: interaction.user.tag }
            );

        await interaction.reply({ embeds: [embed] });
    }
};