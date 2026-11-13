const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display member avatar in this server')
        .addUserOption(opt => opt.setName('target').setDescription('Target member')),

    async execute(interaction) {
        const member = interaction.options.getMember('target') || interaction.member;
        const avatarUrl = member.displayAvatarURL({ size: 1024, dynamic: true });

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle(`<:style_profile:1570745803369095240> Avatar - ${member.user.tag}`)
            .setImage(avatarUrl);

        await interaction.reply({ embeds: [embed] });
    }
};