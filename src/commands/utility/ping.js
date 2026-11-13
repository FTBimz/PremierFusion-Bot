const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot network latency'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setDescription(`🏓 **Pong!**\nBot Latency: \`${Date.now() - interaction.createdTimestamp}ms\`\nAPI Latency: \`${Math.round(interaction.client.ws.ping)}ms\``);
        await interaction.reply({ embeds: [embed] });
    }
};