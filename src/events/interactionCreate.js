const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // 1. Handling Slash Commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}:`, error);
                if (interaction.deferred || interaction.replied) {
                    await interaction.followUp({ content: '<:red_tick:1552640233164771338> There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: '<:red_tick:1552640233164771338> There was an error while executing this command!', ephemeral: true });
                }
            }
        }

        // 2. Handling Button Interactions
        if (interaction.isButton()) {
            
            // --- SUPPORT SERVER BUTTON (/about) ---
            if (interaction.customId === 'support_server_btn') {
                return interaction.reply({
                    content: 'https://discord.gg/AwYnSzUE9P',
                    ephemeral: true
                });
            }

            // --- OPEN TICKET BUTTON ---
            if (interaction.customId === 'open_ticket') {
                await interaction.deferReply({ ephemeral: true });

                const guild = interaction.guild;
                const user = interaction.user;
                const channelName = `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

                // Cek apakah user sudah memiliki channel tiket yang terbuka
                const existingChannel = guild.channels.cache.find(c => c.name === channelName);
                if (existingChannel) {
                    return interaction.editReply({
                        content: `<:red_tick:1552640233164771338> **Ticket Already Open**: You already have an active ticket channel in ${existingChannel}.`
                    });
                }

                try {
                    // Buat Channel Privat Baru di Kategori yang Sama dengan Channel Panel
                    const ticketChannel = await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: interaction.channel.parentId, // Otomatis sejajar di bawah Kategori channel ini
                        permissionOverwrites: [
                            {
                                id: guild.id, // @everyone (Sembunyikan dari member lain)
                                deny: [PermissionFlagsBits.ViewChannel]
                            },
                            {
                                id: user.id, // Pembuat Tiket
                                allow: [
                                    PermissionFlagsBits.ViewChannel,
                                    PermissionFlagsBits.SendMessages,
                                    PermissionFlagsBits.ReadMessageHistory,
                                    PermissionFlagsBits.AttachFiles
                                ]
                            },
                            {
                                id: client.user.id, // Bot PremierDEV
                                allow: [
                                    PermissionFlagsBits.ViewChannel,
                                    PermissionFlagsBits.SendMessages,
                                    PermissionFlagsBits.ManageChannels
                                ]
                            }
                        ]
                    });

                    // Embed Sambutan di dalam Channel Tiket Baru
                    const ticketEmbed = new EmbedBuilder()
                        .setColor('#d8b8ff')
                        .setTitle(`<:ticket:1570690329441734728> Ticket Support - ${user.username}`)
                        .setDescription(`Hello ${user}, thank you for reaching out!\nPlease describe your issue or inquiry in detail below. Our support team will assist you shortly.`)
                        .setTimestamp();

                    const closeRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close_ticket')
                            .setLabel('Close Ticket')
                            .setEmoji('🔒')
                            .setStyle(ButtonStyle.Danger)
                    );

                    await ticketChannel.send({ 
                        content: `${user}`, 
                        embeds: [ticketEmbed], 
                        components: [closeRow] 
                    });

                    await interaction.editReply({
                        content: `<:green_tick:1552640231239323668> **Ticket Created**: Your ticket channel has been created in ${ticketChannel}.`
                    });
                } catch (error) {
                    console.error('Ticket Creation Error:', error);
                    await interaction.editReply({
                        content: '<:red_tick:1552640233164771338> **Failed to Create Ticket**: Ensure the bot has the `Manage Channels` permission.'
                    });
                }
            }

            // --- CLOSE TICKET BUTTON ---
            if (interaction.customId === 'close_ticket') {
                await interaction.deferReply({ ephemeral: true });

                await interaction.editReply({
                    content: '🔒 **Closing Ticket**: This ticket channel will be deleted in 5 seconds...'
                });

                setTimeout(async () => {
                    try {
                        await interaction.channel.delete();
                    } catch (err) {
                        console.error('Failed to delete channel:', err);
                    }
                }, 5000);
            }
        }
    }
};