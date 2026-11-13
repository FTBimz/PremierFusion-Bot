const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Search and fetch direct YouTube video player')
        .addStringOption(opt => opt.setName('query').setDescription('Video title or search query').setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();

        const query = interaction.options.getString('query').trim();
        if (!query) {
            return interaction.editReply({ content: '<:red_tick:1552640233164771338> **Input Invalid**: Search query cannot be empty.' });
        }

        try {
            const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                timeout: 10000
            });

            // Ekstrak Video ID pertama dari hasil pencarian HTML YouTube
            const match = response.data.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);

            if (!match || !match[1]) {
                return interaction.editReply({ content: '<:red_tick:1552640233164771338> **Input Invalid**: Video not found for the given search query.' });
            }

            const videoUrl = `https://www.youtube.com/watch?v=${match[1]}`;
            // Kirim link mentah agar Discord otomatis membuat Embed Player Native
            await interaction.editReply({ content: videoUrl });
        } catch (error) {
            console.error('YouTube Search Error:', error.message);
            await interaction.editReply({ content: '<:red_tick:1552640233164771338> **Input Invalid**: Unable to fetch YouTube search results at this moment.' });
        }
    }
};