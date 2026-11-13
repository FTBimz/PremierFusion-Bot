const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Add an emoji reaction to a message using Message ID')
        .addStringOption(opt => opt.setName('message_id').setDescription('Target Message ID').setRequired(true))
        .addStringOption(opt => opt.setName('emoji').setDescription('Emoji to react with').setRequired(true)),

    async execute(interaction) {
        const msgId = interaction.options.getString('message_id');
        const emojiStr = interaction.options.getString('emoji');

        try {
            const msg = await interaction.channel.messages.fetch(msgId);
            await msg.react(emojiStr);
            await interaction.reply({ content: `Reaction ${emojiStr} added to message \`${msgId}\`.`, ephemeral: true });
        } catch {
            await interaction.reply({ content: '**Input Invalid**: Message not found or external emoji is unavailable.', ephemeral: true });
        }
    }
};