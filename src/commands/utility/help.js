const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display the list of available PremierFusion commands'),

    async execute(interaction) {
        const botAvatar = interaction.client.user.displayAvatarURL();

        const embed = new EmbedBuilder()
            .setColor('#d8b8ff')
            .setTitle('<:blurple_slash_commands:1570689809947697242> PremierFusion Command Guide')
            .setDescription('Here is the complete list of **31** commands available in this server:')
            .addFields(
                {
                    name: '<a:mod:1546416726084821054> Moderation',
                    value: [
                        '`/ban` - Ban a user from the server',
                        '`/unban` - Unban a user by User ID',
                        '`/kick` - Kick a member from the server',
                        '`/mute` - Timeout a member',
                        '`/unmute` - Remove timeout from a member',
                        '`/warn` - Send an official warning to a member DM',
                        '`/purge` - Bulk delete messages (1 to 200)',
                        '`/addrole` - Assign a role to a member'
                    ].join('\n')
                },
                {
                    name: '<:announcement:1570689814473474119> Utilities & Management',
                    value: [
                        '`/announcement` - Send an announcement to a channel',
                        '`/send` - Send a custom message without pings',
                        '`/ticket setup` & `/ticket settings` - Support ticket system',
                        '`/trigger` - Custom auto-response triggers',
                        '`/note` - Personal private notes',
                        '`/reaction` - Add an emoji reaction via Message ID',
                        '`/afk` - Set your AFK status and message'
                    ].join('\n')
                },
                {
                    name: '<:laptop:1546416722733703168> Information',
                    value: [
                        '`/userinfo` - Display member information',
                        '`/serverinfo` - Display server statistics',
                        '`/servericon` - Display server icon',
                        '`/roleinfo` - Display detailed role information',
                        '`/avatar` - Display member avatar'
                    ].join('\n')
                },
                {
                    name: '<:giveaway:1570690237221572621> Fun & Interaction',
                    value: [
                        '`/giveaway` - Giveaway management system',
                        '`/dice` - Roll a dice',
                        '`/8ball` - Ask the Magic 8-Ball a question'
                    ].join('\n')
                },
                {
                    name: '<a:click_media:1570739499326119936> Search & Media',
                    value: [
                        '`/google` - Search something on Google',
                        '`/maps` - Search a location on Google Maps',
                        '`/translate` - Translate text using Google Translate',
                        '`/youtube` - Search and fetch YouTube video player',
                        '`/weather` - Display global weather information'
                    ].join('\n')
                },
                {
                    name: '<a:yellow_gears:1570689808228155402> System',
                    value: [
                        '`/calculator` - Simple and complex math calculator',
                        '`/ping` - Check bot network latency',
                        '`/help` - Display this command guide',
                        '`/about` - About PremierFusion Bot'
                    ].join('\n')
                }
            )
            .setFooter({
                text: 'Use / (slash) to view command options.',
                iconURL: botAvatar
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};