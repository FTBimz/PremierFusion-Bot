const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Timeout a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('target').setDescription('Member to mute').setRequired(true))
        .addIntegerOption(opt => opt.setName('duration').setDescription('Duration in minutes').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for mute')),

    async execute(interaction) {
        const member = interaction.options.getMember('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!member || !member.moderatable) return interaction.reply({ content: '<:red_tick:1552640233164771338> **Error**: Cannot mute this member.', ephemeral: true });

        await member.timeout(duration * 60 * 1000, reason);
        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle('<:timeout:1570751002573930616> Member Timed Out')
            .setDescription(`**${member.user.tag}** has been timed out for **${duration} minutes**.\nReason: ${reason}`);

        await interaction.reply({ embeds: [embed] });
    }
};