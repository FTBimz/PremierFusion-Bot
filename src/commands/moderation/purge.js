const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Bulk delete messages (1 to 200)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(opt => 
            opt.setName('amount')
               .setDescription('Number of messages to delete (1-200)')
               .setMinValue(1)
               .setMaxValue(200)
               .setRequired(true)),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        await interaction.deferReply({ ephemeral: true });

        try {
            let deletedCount = 0;
            if (amount <= 100) {
                const deleted = await interaction.channel.bulkDelete(amount, true);
                deletedCount = deleted.size;
            } else {
                const firstBatch = await interaction.channel.bulkDelete(100, true);
                const remaining = amount - firstBatch.size;
                deletedCount += firstBatch.size;
                if (remaining > 0) {
                    const secondBatch = await interaction.channel.bulkDelete(remaining, true);
                    deletedCount += secondBatch.size;
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle('🧹 Purge Successful')
                .setDescription(`Deleted **${deletedCount}** messages from this channel.`);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Purge Error:', error);
            await interaction.editReply({ content: '<:red_tick:1552640233164771338> **Purge Error**: Cannot delete messages older than 14 days or lacking permissions.' });
        }
    }
};