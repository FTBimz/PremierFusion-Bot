const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('calculator')
        .setDescription('Simple and complex math calculator')
        .addStringOption(option => 
            option.setName('expression')
                .setDescription('Example: 10 / 2, 10 : 2, 5 x 5, or (2 + 3) * 4')
                .setRequired(true)),

    async execute(interaction) {
        const expr = interaction.options.getString('expression');
        
        try {
            // Convert division (: and ÷) to / and multiplication (x and ×) to *
            let sanitizedExpr = expr
                .replace(/÷|:/g, '/')
                .replace(/×|x|X/g, '*')
                .replace(/,/g, '.');

            // Validate safe characters (numbers and math operators only)
            if (/[^0-9+\-*/%(). ]/.test(sanitizedExpr)) {
                throw new Error('Invalid characters');
            }

            // Evaluate calculation
            const result = Function(`'use strict'; return (${sanitizedExpr})`)();

            if (result === undefined || isNaN(result)) {
                throw new Error('Invalid result');
            }

            const embed = new EmbedBuilder()
                .setTitle('<:calculator:1570689812132790352> Calculator')
                .setColor('#d8b8ff')
                .addFields(
                    { name: 'Expression:', value: `\`\`\`${expr}\`\`\`` },
                    { name: 'Result:', value: `\`\`\`${result}\`\`\`` }
                )
                .setFooter({ text: '💡 Tip: You can use + (add), - (subtract), * or x (multiply), / or : (divide).' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const errEmbed = new EmbedBuilder()
                .setColor('#ED4245')
                .setDescription('<:red_tick:1552640233164771338> Invalid mathematical expression!')
                .setFooter({ text: '💡 Tip: Use a valid math format (Example: 10 : 2 or 10 / 2).' });

            await interaction.reply({ embeds: [errEmbed], ephemeral: true });
        }
    }
};