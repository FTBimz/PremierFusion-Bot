const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('maps')
        .setDescription('Search a location on Google Maps')
        .addStringOption(option => 
            option.setName('location')
                .setDescription('Address or place name')
                .setRequired(true)),
    async execute(interaction) {
        const location = interaction.options.getString('location');
        const encodedLocation = encodeURIComponent(location);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle('<:google_maps:1570689227862188134> Google Maps Search')
            .setDescription(`Searched location: **${location}**\n[Open in Google Maps](${mapsUrl})`);
        
        await interaction.reply({ embeds: [embed] });
    }
};