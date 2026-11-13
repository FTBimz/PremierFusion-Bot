const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ComponentType 
} = require('discord.js');

// Map penyimpanan data catatan per User ID
const notesStore = new Map();
const MAX_NOTES_PER_USER = 10;

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('note')
        .setDescription('Personal notes system')
        .addSubcommand(sub =>
            sub.setName('add')
               .setDescription('Add a personal note (Max 10 notes)')
               .addStringOption(opt => 
                   opt.setName('note')
                      .setDescription('Note content (Max 2000 characters)')
                      .setMaxLength(2000)
                      .setRequired(true)
               )
               .addStringOption(opt =>
                   opt.setName('color')
                      .setDescription('Embed color for this note')
                      .setRequired(true)
                      .addChoices(
                          { name: 'Purple', value: '#9B59B6' },
                          { name: 'Pink', value: '#E91E63' },
                          { name: 'Red', value: '#ED4245' },
                          { name: 'Orange', value: '#E67E22' },
                          { name: 'Yellow', value: '#F1C40F' },
                          { name: 'Green', value: '#57F287' },
                          { name: 'Blue', value: '#3498DB' },
                          { name: 'Grey', value: '#95A5A6' },
                          { name: 'White', value: '#FFFFFF' }
                      )
               )
        )
        .addSubcommand(sub =>
            sub.setName('view')
               .setDescription('View your saved notes with a dropdown menu'))
        .addSubcommand(sub =>
            sub.setName('clear')
               .setDescription('Clear all saved notes')),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        if (!notesStore.has(userId)) {
            notesStore.set(userId, []);
        }
        const userNotes = notesStore.get(userId);

        // --- SUBCOMMAND: ADD ---
        if (sub === 'add') {
            if (userNotes.length >= MAX_NOTES_PER_USER) {
                return interaction.editReply({ 
                    content: `<:red_tick:1552640233164771338> **Limit Reached**: You can only save up to ${MAX_NOTES_PER_USER} notes. Please delete some using \`/note clear\` or manage existing ones.` 
                });
            }

            const noteContent = interaction.options.getString('note').trim();
            const chosenColor = interaction.options.getString('color');

            if (!noteContent || noteContent.length > 2000) {
                return interaction.editReply({ 
                    content: '<:red_tick:1552640233164771338> **Invalid Input**: Note content must not be empty and cannot exceed 2000 characters.' 
                });
            }

            const newNote = {
                id: Date.now().toString(),
                text: noteContent,
                color: chosenColor,
                createdAt: new Date().toLocaleString()
            };

            userNotes.push(newNote);

            const successEmbed = new EmbedBuilder()
                .setColor(chosenColor)
                .setTitle('<:green_tick:1552640231239323668> Note Saved Successfully')
                .setDescription(`**Note Slot #${userNotes.length}/${MAX_NOTES_PER_USER}**\n${noteContent.length > 100 ? noteContent.substring(0, 100) + '...' : noteContent}`)
                .setFooter({ text: `Saved on ${newNote.createdAt}` });

            return interaction.editReply({ embeds: [successEmbed] });
        }

        // --- SUBCOMMAND: CLEAR ---
        if (sub === 'clear') {
            if (userNotes.length === 0) {
                return interaction.editReply({ content: '<:notepad_10:1570740716802674769> You do not have any saved notes to clear.' });
            }

            notesStore.set(userId, []);
            return interaction.editReply({ content: '🧹 **Notes Cleared**: All your personal notes have been permanently deleted.' });
        }

        // --- SUBCOMMAND: VIEW ---
        if (sub === 'view') {
            if (userNotes.length === 0) {
                return interaction.editReply({ content: '<:notepad_10:1570740716802674769> You have no saved notes. Use `/note add` to create one.' });
            }

            // Ringkasan daftar semua catatan
            const listDescription = userNotes.map((note, index) => {
                const preview = note.text.length > 50 ? note.text.substring(0, 50) + '...' : note.text;
                return `**${index + 1}.** ${preview} *(${note.createdAt})*`;
            }).join('\n');

            const overviewEmbed = new EmbedBuilder()
                .setColor('#d8b8ff')
                .setTitle(`<:notepad_10:1570740716802674769> ${interaction.user.username}'s Notes List (${userNotes.length}/${MAX_NOTES_PER_USER})`)
                .setDescription(listDescription + '\n\n👇 *Select a note from the dropdown menu below to read its full content.*')
                .setTimestamp();

            // Membuat Select Menu Dropdown
            const selectOptions = userNotes.map((note, index) => ({
                label: `Note #${index + 1}`,
                description: note.text.length > 40 ? note.text.substring(0, 40) + '...' : note.text,
                value: index.toString()
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_note')
                .setPlaceholder('Choose a note to view full content...')
                .addOptions(selectOptions);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            const response = await interaction.editReply({
                embeds: [overviewEmbed],
                components: [row]
            });

            // Collector untuk merespons interaksi Dropdown Select Menu secara Ephemeral
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 60000 // Aktif selama 60 detik
            });

            collector.on('collect', async (menuInteraction) => {
                if (menuInteraction.user.id !== interaction.user.id) {
                    return menuInteraction.reply({ content: '<:red_tick:1552640233164771338> You cannot interact with this menu.', ephemeral: true });
                }

                const selectedIndex = parseInt(menuInteraction.values[0]);
                const selectedNote = userNotes[selectedIndex];

                if (!selectedNote) {
                    return menuInteraction.reply({ content: '<:red_tick:1552640233164771338> Selected note was not found.', ephemeral: true });
                }

                const noteDetailEmbed = new EmbedBuilder()
                    .setColor(selectedNote.color)
                    .setTitle(`<:notepad_10:1570740716802674769> Full Content - Note #${selectedIndex + 1}`)
                    .setDescription(selectedNote.text)
                    .setFooter({ text: `Created on ${selectedNote.createdAt}` });

                await menuInteraction.reply({
                    embeds: [noteDetailEmbed],
                    ephemeral: true
                });
            });

            collector.on('end', async () => {
                // Nonaktifkan dropdown setelah timeout 60 detik
                selectMenu.setDisabled(true);
                selectMenu.setPlaceholder('Menu expired. Re-run /note view to select again.');
                await interaction.editReply({ components: [row] }).catch(() => {});
            });
        }
    }
};