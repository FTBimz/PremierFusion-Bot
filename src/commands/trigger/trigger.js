const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getTriggers, setTriggers } = require('../../utils/triggerStore');

const MAX_TRIGGERS = 10;

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('trigger')
        .setDescription('Custom input-to-output text trigger system')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub.setName('create')
               .setDescription('Create a custom trigger (Max 10 per server)')
               .addStringOption(o => o.setName('input').setDescription('Trigger keyword').setRequired(true))
               .addStringOption(o => o.setName('output').setDescription('Trigger response content').setRequired(true))
               .addStringOption(o => o.setName('type').setDescription('Response type').setRequired(true)
                    .addChoices(
                        { name: 'Normal', value: 'normal' },
                        { name: 'Reply', value: 'reply' },
                        { name: 'Mention', value: 'mention' }
                    )))
        .addSubcommand(sub =>
            sub.setName('edit')
               .setDescription('Edit an existing trigger')
               .addStringOption(o => o.setName('input').setDescription('Existing keyword').setRequired(true))
               .addStringOption(o => o.setName('new_output').setDescription('New response content').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('list')
               .setDescription('List active triggers in this server'))
        .addSubcommand(sub =>
            sub.setName('delete')
               .setDescription('Delete a trigger')
               .addStringOption(o => o.setName('input').setDescription('Trigger keyword to delete').setRequired(true))),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({ content: '<:red_tick:1552640233164771338> This command can only be used inside a server.', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        // Ambil salinan array khusus untuk guildId ini agar tidak tercampur server lain
        const list = [...getTriggers(guildId)];

        if (sub === 'create') {
            if (list.length >= MAX_TRIGGERS) {
                return interaction.reply({ 
                    content: `<:red_tick:1552640233164771338> **Limit Reached**: Maximum trigger limit of ${MAX_TRIGGERS} reached for this server.`, 
                    ephemeral: true 
                });
            }

            const input = interaction.options.getString('input').trim();
            const output = interaction.options.getString('output');
            const type = interaction.options.getString('type');

            // Cek duplikasi keyword khusus di server ini saja
            const isDuplicate = list.some(t => t.input.toLowerCase() === input.toLowerCase());
            if (isDuplicate) {
                return interaction.reply({ 
                    content: `<:red_tick:1552640233164771338> **Duplicate Trigger**: The keyword \`${input}\` already exists in this server. Use \`/trigger edit\` instead.`, 
                    ephemeral: true 
                });
            }

            list.push({ input, output, type });
            setTriggers(guildId, list);

            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle('⚡ Trigger Created')
                .setDescription(`Created trigger for \`${input}\` with **${type}** response.`)
                .setFooter({ text: `Server Slots: ${list.length}/${MAX_TRIGGERS}` });

            return interaction.reply({ embeds: [embed] });

        } else if (sub === 'list') {
            const embed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle(`⚡ Active Triggers - ${interaction.guild.name}`)
                .setDescription(
                    list.length > 0 
                        ? list.map((t, i) => `**${i + 1}.** \`${t.input}\` ➡️ ${t.output} *(Type: ${t.type})*`).join('\n') 
                        : 'No custom triggers established in this server.'
                )
                .setFooter({ text: `Total: ${list.length}/${MAX_TRIGGERS} triggers` });

            return interaction.reply({ embeds: [embed] });

        } else if (sub === 'delete') {
            const input = interaction.options.getString('input').trim();
            const updated = list.filter(t => t.input.toLowerCase() !== input.toLowerCase());

            if (updated.length === list.length) {
                return interaction.reply({ 
                    content: `<:red_tick:1552640233164771338> **Not Found**: Trigger keyword \`${input}\` does not exist in this server.`, 
                    ephemeral: true 
                });
            }

            setTriggers(guildId, updated);
            return interaction.reply({ 
                content: `<:green_tick:1552640231239323668> Deleted trigger keyword \`${input}\` (${updated.length}/${MAX_TRIGGERS} remaining).`, 
                ephemeral: true 
            });

        } else if (sub === 'edit') {
            const input = interaction.options.getString('input').trim();
            const newOutput = interaction.options.getString('new_output');
            const targetIndex = list.findIndex(t => t.input.toLowerCase() === input.toLowerCase());

            if (targetIndex === -1) {
                return interaction.reply({ 
                    content: `<:red_tick:1552640233164771338> **Error**: Trigger keyword not found in this server.`, 
                    ephemeral: true 
                });
            }

            list[targetIndex].output = newOutput;
            setTriggers(guildId, list);

            return interaction.reply({ 
                content: `<:green_tick:1552640231239323668> Updated output for trigger \`${input}\`.`, 
                ephemeral: true 
            });
        }
    }
};