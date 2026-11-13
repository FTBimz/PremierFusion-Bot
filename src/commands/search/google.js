const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('google')
        .setDescription('Search something on Google')
        .addStringOption(option => 
            option.setName('query')
                .setDescription('Search keywords')
                .setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const encodedQuery = encodeURIComponent(query);
        const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle('<:google:1570689226079600711> Google Search Results')
            .setDescription(`Here are the search results for **${query}**:\n[Click here to view results](${searchUrl})`);
        
        await interaction.reply({ embeds: [embed] });
    }
};