const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Assign a role to a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(opt => opt.setName('target').setDescription('Target member').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to assign').setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getMember('target');
        const role = interaction.options.getRole('role');

        if (member.roles.cache.has(role.id)) {
            return interaction.reply({ content: '<:red_tick:1552640233164771338> **Error**: Member already has this role.', ephemeral: true });
        }

        try {
            await member.roles.add(role);
            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle('<:green_tick:1552640233164771338> Role Assigned')
                .setDescription(`Assigned **${role.name}** to **${member.user.tag}**.`);

            await interaction.reply({ embeds: [embed] });
        } catch {
            await interaction.reply({ content: '<:red_tick:1552640233164771338> **Permission Error**: Cannot assign this role (Role Hierarchy).', ephemeral: true });
        }
    }
};