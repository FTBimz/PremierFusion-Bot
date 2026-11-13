const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`[PremierFusion] Logged in successfully as ${client.user.tag}`);
        client.user.setActivity('Task Manager', { type: ActivityType.Playing });
    }
};