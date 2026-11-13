const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Send an official warning directly to a member DM')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('target').setDescription('Member to warn').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('Warning reason').setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason');

        if (!target) return interaction.reply({ content: '<:red_tick:1552640233164771338> **Error**: Target member not found in this server.', ephemeral: true });
        
        // Custom Bot Warning Validation
        if (target.user.bot) {
            return interaction.reply({ content: '<:red_tick:1552640233164771338> **Unsupported Warned for Bot**: Cannot send warning DMs to bot accounts.', ephemeral: true });
        }

        const dmEmbed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle(`⚠️ Official Warning from ${interaction.guild.name}`)
            .setDescription(`You have received an official warning.`)
            .addFields(
                { name: 'Reason', value: reason },
                { name: 'Moderator', value: interaction.user.tag }
            )
            .setTimestamp();

        try {
            await target.send({ embeds: [dmEmbed] });
            const replyEmbed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle('<:green_tick:1552640233164771338> Member Warned')
                .setDescription(`Successfully sent warning DM to **${target.user.tag}**.\nReason: ${reason}`);

            await interaction.reply({ embeds: [replyEmbed] });
        } catch {
            await interaction.reply({ content: '<:red_tick:1552640233164771338> **DM Failed**: Could not send warning DM to this user (DMs closed).', ephemeral: true });
        }
    }
};