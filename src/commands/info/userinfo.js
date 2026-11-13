const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display comprehensive member information in this server')
        .addUserOption(opt => opt.setName('target').setDescription('Target member')),

    async execute(interaction) {
        const member = interaction.options.getMember('target') || interaction.member;
        const user = member.user;

        const createdDays = Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24));
        const roles = member.roles.cache.filter(r => r.id !== interaction.guild.id);
        const topRole = member.roles.highest.id !== interaction.guild.id ? member.roles.highest.toString() : 'None';
        const roleCount = roles.size;
        const roleList = roleCount > 0 ? roles.map(r => r.toString()).join(', ') : 'None';

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle(`<:member:1570748709640208515> Member Information - ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Username', value: user.username, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Created At', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: 'Bot Account', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Account Age', value: `${createdDays} days`, inline: true },
                { name: 'Top Role', value: topRole, inline: true },
                { name: 'Role Count', value: `${roleCount}`, inline: true },
                { name: 'Roles', value: roleList.length > 1024 ? `${roleCount} roles` : roleList, inline: false }
            );

        await interaction.reply({ embeds: [embed] });
    }
};