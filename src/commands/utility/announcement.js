const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB Limit

module.exports = {
    cooldown: 120, // 2 Minutes Cooldown
    data: new SlashCommandBuilder()
        .setName('announcement')
        .setDescription('Send an announcement to a specific channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(opt =>
            opt.setName('channel')
               .setDescription('Target channel for the announcement')
               .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
               .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('message')
               .setDescription('Announcement message content')
               .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('ping')
               .setDescription('Ping option (@everyone, @here, or role)')
               .setRequired(false)
               .addChoices(
                   { name: '@everyone', value: 'everyone' },
                   { name: '@here', value: 'here' },
                   { name: 'Role Mention', value: 'role' }
               )
        )
        .addRoleOption(opt =>
            opt.setName('mention_role')
               .setDescription('Role to ping (if ping is set to Role Mention)')
               .setRequired(false)
        )
        .addAttachmentOption(opt =>
            opt.setName('attachment_1')
               .setDescription('File 1 (Image/Video/Document)')
               .setRequired(false)
        )
        .addAttachmentOption(opt =>
            opt.setName('attachment_2')
               .setDescription('File 2 (Image/Video/Document)')
               .setRequired(false)
        )
        .addAttachmentOption(opt =>
            opt.setName('attachment_3')
               .setDescription('File 3 (Image/Video/Document)')
               .setRequired(false)
        )
        .addAttachmentOption(opt =>
            opt.setName('attachment_4')
               .setDescription('File 4 (Image/Video/Document)')
               .setRequired(false)
        )
        .addAttachmentOption(opt =>
            opt.setName('attachment_5')
               .setDescription('File 5 (Image/Video/Document)')
               .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetChannel = interaction.options.getChannel('channel');
        const messageContent = interaction.options.getString('message');
        const pingType = interaction.options.getString('ping');
        const mentionRole = interaction.options.getRole('mention_role');

        // Collect all uploaded attachments (Up to 5 files)
        const attachments = [
            interaction.options.getAttachment('attachment_1'),
            interaction.options.getAttachment('attachment_2'),
            interaction.options.getAttachment('attachment_3'),
            interaction.options.getAttachment('attachment_4'),
            interaction.options.getAttachment('attachment_5')
        ].filter(Boolean);

        // Validate 50MB file size limit per attachment
        for (const attachment of attachments) {
            if (attachment.size > MAX_FILE_SIZE) {
                return interaction.editReply({
                    content: `<:red_tick:1552640233164771338> **File Size Limit Exceeded**: File \`${attachment.name}\` exceeds the maximum allowed limit of 50MB.`
                });
            }
        }

        // Build Ping Mention
        let pingText = '';
        if (pingType === 'everyone') {
            pingText = '@everyone';
        } else if (pingType === 'here') {
            pingText = '@here';
        } else if (pingType === 'role' && mentionRole) {
            pingText = `<@&${mentionRole.id}>`;
        } else if (mentionRole) {
            pingText = `<@&${mentionRole.id}>`;
        }

        // Assemble Plain Text Payload (No Embed Container)
        let finalContent = '';
        if (pingText) finalContent += `${pingText}\n`;
        finalContent += messageContent;

        const payload = {
            content: finalContent
        };

        if (attachments.length > 0) {
            payload.files = attachments.map(att => att.url);
        }

        try {
            await targetChannel.send(payload);
            await interaction.editReply({
                content: `<:green_tick:1552640231239323668> **Announcement published to ${targetChannel}.**`
            });
        } catch (error) {
            console.error('Announcement Error:', error.message);
            await interaction.editReply({
                content: `<:red_tick:1552640233164771338> **Publish Failed**: Unable to send announcement to ${targetChannel}. Please check bot permissions.`
            });
        }
    }
};