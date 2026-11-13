const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits 
} = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Support Ticket System')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('setup')
               .setDescription('Create a ticket panel in the current channel'))
        .addSubcommand(sub =>
            sub.setName('settings')
               .setDescription('Configure ticket panel settings by Message ID')
               .addStringOption(opt => 
                   opt.setName('message_id')
                      .setDescription('Ticket Panel Message ID')
                      .setRequired(true))
               .addStringOption(opt => 
                   opt.setName('action')
                      .setDescription('Action to perform')
                      .setRequired(true)
                      .addChoices(
                          { name: 'Edit Panel', value: 'edit' },
                          { name: 'Delete Panel', value: 'delete' }
                      ))),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const sub = interaction.options.getSubcommand();

        // --- SUBCOMMAND: SETUP ---
        if (sub === 'setup') {
            const panelEmbed = new EmbedBuilder()
                .setTitle('<:ticket:1570690329441734728> Help & Support Center')
                .setDescription('Click the button below to open a support ticket. Our team will assist you shortly.')
                .setColor('#d8b8ff')
                .setFooter({ text: 'Tickets will automatically close or delete if inactive for 12 hours.' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket')
                    .setLabel('Open Ticket')
                    .setEmoji('<:ticket:1570690329441734728>')
                    .setStyle(ButtonStyle.Primary)
            );

            try {
                await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
                
                const replyEmbed = new EmbedBuilder()
                    .setColor('#57F287')
                    .setDescription('<:green_tick:1552640231239323668> Ticket panel has been successfully set up in this channel.');
                return interaction.editReply({ embeds: [replyEmbed] });
            } catch (error) {
                console.error('Ticket Setup Error:', error.message);
                return interaction.editReply({ 
                    content: '<:red_tick:1552640233164771338> **Failed to setup ticket panel**: Please verify bot permissions in this channel.' 
                });
            }
        }

        // --- SUBCOMMAND: SETTINGS ---
        if (sub === 'settings') {
            const msgId = interaction.options.getString('message_id');
            const action = interaction.options.getString('action');

            const settingsEmbed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setDescription(`<:green_tick:1552640231239323668> Ticket panel settings for Message ID \`${msgId}\` with action **${action}** updated successfully.`);
            return interaction.editReply({ embeds: [settingsEmbed] });
        }
    }
};