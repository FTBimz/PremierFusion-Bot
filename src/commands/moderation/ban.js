const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('target').setDescription('User to ban').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for ban')),

    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            await interaction.guild.members.ban(user, { reason });
            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle('🔨 User Banned')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})` },
                    { name: 'Reason', value: reason },
                    { name: 'Moderator', value: interaction.user.tag }
                );

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ content: '<:red_tick:1552640233164771338> **Error**: Unable to ban user.', ephemeral: true });
        }
    }
};