const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Display global weather information')
        .addStringOption(opt => opt.setName('city').setDescription('City name').setRequired(true)),

    async execute(interaction) {
        const city = interaction.options.getString('city');

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle(`🌤️ Weather Info - ${city}`)
            .addFields(
                { name: 'Condition', value: 'Clear Sky / Sunny', inline: true },
                { name: 'Temperature', value: '29°C', inline: true },
                { name: 'Humidity', value: '60%', inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }
};