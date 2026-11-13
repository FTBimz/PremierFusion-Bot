const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll a dice')
        .addIntegerOption(opt => 
            opt.setName('sides')
                .setDescription('Number of dice sides (default: 6)')
                .setMinValue(2)),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const result = Math.floor(Math.random() * sides) + 1;

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setDescription(`🎲 You rolled a **D${sides}** dice and got **${result}**!`);
        await interaction.reply({ embeds: [embed] });
    }
};