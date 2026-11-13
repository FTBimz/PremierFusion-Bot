const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Display detailed information about a specific role')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to inspect')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const role = interaction.options.getRole('role');

        // Tarik cache member agar hitungan Member & Bot akurat (tidak 0)
        await interaction.guild.members.fetch().catch(() => {});

        const totalMembers = role.members.size;
        const botCount = role.members.filter(member => member.user.bot).size;
        const humanCount = totalMembers - botCount;

        // Ikuti warna role, gunakan #d8b8ff jika role tidak berwarna (#000000)
        const embedColor = role.hexColor === '#000000' ? '#d8b8ff' : role.hexColor;

        const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`<:information:1570748730439766107> Role Information - ${role.name}`)
            .addFields(
                { name: 'Role Tag', value: `<@&${role.id}>`, inline: true },
                { name: 'Role ID', value: `\`${role.id}\``, inline: true },
                { name: 'Color Hex', value: `\`${role.hexColor.toUpperCase()}\``, inline: true },
                { name: 'Member Count', value: `${humanCount}`, inline: true },
                { name: 'Bot Count', value: `${botCount}`, inline: true },
                { name: 'Total', value: `${totalMembers}`, inline: true }
            )
            .setTimestamp();

        // allowedMentions kosong agar tag role tampil rapi tanpa memicu ping
        await interaction.editReply({
            embeds: [embed],
            allowedMentions: { parse: [] }
        });
    }
};