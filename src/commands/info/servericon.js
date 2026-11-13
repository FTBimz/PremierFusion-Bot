const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('servericon')
        .setDescription('Display server icon'),

    async execute(interaction) {
        const icon = interaction.guild.iconURL({ size: 1024, dynamic: true });
        if (!icon) {
            return interaction.reply({ content: '<:red_tick:1552640233164771338> **Error**: This server does not have a custom icon set.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle(`<:style_profile:1570745803369095240> Icon - ${interaction.guild.name}`)
            .setImage(icon);

        await interaction.reply({ embeds: [embed] });
    }
};