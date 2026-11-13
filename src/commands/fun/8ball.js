const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the Magic 8-Ball a question')
        .addStringOption(opt => 
            opt.setName('question')
                .setDescription('Your question')
                .setRequired(true)),
    async execute(interaction) {
        const answers = [
            'Yes, definitely.',
            'It is decidedly so.',
            'Signs point to yes.',
            'Ask again later.',
            'Cannot predict now.',
            "Don't count on it.",
            'My reply is no.',
            'Very doubtful.'
        ];
        const question = interaction.options.getString('question');
        const reply = answers[Math.floor(Math.random() * answers.length)];

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: 'Question:', value: question },
                { name: 'Answer:', value: reply }
            );
        await interaction.reply({ embeds: [embed] });
    }
};