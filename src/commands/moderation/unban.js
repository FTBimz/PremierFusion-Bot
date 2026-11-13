const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user by User ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(opt => opt.setName('user_id').setDescription('User ID to unban').setRequired(true)),

    async execute(interaction) {
        const userId = interaction.options.getString('user_id');

        try {
            await interaction.guild.members.unban(userId);
            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle('🔓 User Unbanned')
                .setDescription(`Successfully unbanned User ID: **${userId}**`);

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ content: '<:red_tick:1552640233164771338> **Error**: User ID is not banned or invalid.', ephemeral: true });
        }
    }
};