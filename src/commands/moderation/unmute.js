const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove timeout from a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('target').setDescription('Member to unmute').setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getMember('target');

        if (!member || !member.isCommunicationDisabled()) {
            return interaction.reply({ content: '<:red_tick:1552640233164771338> **Error**: Member is not currently timed out.', ephemeral: true });
        }

        await member.timeout(null);
        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle('<:green_tick:1552640233164771338> Timeout Removed')
            .setDescription(`Successfully removed timeout from **${member.user.tag}**.`);

        await interaction.reply({ embeds: [embed] });
    }
};