const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('About PremierFusion Bot'),

    async execute(interaction) {
        const botUser = interaction.client.user;

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setAuthor({
                name: botUser.username,
                iconURL: botUser.displayAvatarURL()
            })
            .setTitle('About')
            .setDescription('**PremierFusion - v2.5.0**\nPremierFusion is a multi-purpose Discord bot designed for server management, automated utilities, ticket systems, and interactive tools.')
            .addFields(
                {
                    name: 'Social Media:',
                    value: '<:youtube:1570690779423313993> [PremierPro](https://www.youtube.com/@XPremierPro)\n<:instagram:1570691672420122635> [@bimamauluta](https://www.instagram.com/bimamauluta?igsh=MW4yYnpyMTlhNnNjbw==)\n<:tiktok:1570690759718600764> [@premier_pro](https://www.tiktok.com/@premier_pro?_r=1&_t=ZS-97wXQhPNoRt)\n<a:discord_animated:1565881272637591672> Support: [Fusion Pro](https://discord.gg/AwYnSzUE9P)'
                },
                {
                    name: 'Support Us:',
                    value: '<:sociabuzz:1570690625093898330> [SociaBuzz](https://sociabuzz.com/bimame/tribe)\n<:saweria:1570690331433767082> [Saweria](https://saweria.co/bimame)\n<:paypal:1570690623198076938> [PayPal](https://www.paypal.com/paypalme/bimamauluta)'
                },
                {
                    name: 'Source:',
                    value: '<:github:1570689223567351899> [GitHub Repository](https://github.com/FTBimz/PremierFusion-Bot)\n\n[Terms of Service](https://drive.google.com/file/d/1KsddlSnrmDW6sbIqoKChEWobLuoxZCC8/view?usp=drive_link) | [Privacy Policy](https://drive.google.com/file/d/1pUAHpJGQqQ6HwHjJecVg93T6e1st8s0-/view?usp=drive_link)'
                }
            )
            .setFooter({
                text: 'Created on 6 Jul 2026 | Built with Node.js & JavaScript from Indonesia 🇮🇩'
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Invite Bot')
                .setURL(`https://discord.com/oauth2/authorize?client_id=1523606198241333319`)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setCustomId('support_server_btn')
                .setLabel('Support Server')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};