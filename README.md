[readme.md](https://github.com/user-attachments/files/34809280/readme.md)
# PremierFusion Bot

PremierFusion is a multi-purpose Discord bot built with Node.js and Discord.js v14, featuring a complete set of moderation tools, management utilities, information queries, fun commands, web search integration, and an advanced AFK system.

## Features

- Moderation: Comprehensive management tools including ban, unban, kick, mute, unmute, warn, purge, and role assignment.
- Utilities: Announcements, custom messages, support ticketing panels, personal private notes, and custom response triggers.
- Information: Detailed member info, server statistics, server icons, role metadata, and avatar viewer.
- Fun and Interaction: Interactive giveaway management system supporting top winner lists and random selection, dice rolling, and magic 8-ball.
- Search and Media: Direct web search, Google Maps location lookup, translation utilities, YouTube video search, and global weather information.
- AFK System: Automatic AFK status handler with nickname management, duration tracking, mention alerts, and an unlimited pagination view.

## Project Structure

```
PremierFusion/
├── data/
│   ├── afk.json
│   └── triggers.json
├── src/
│   ├── commands/
│   ├── events/
│   └── utils/
├── .env
├── deploy-commands.js
├── index.js
├── package-lock.json
└── package.json
```

## Prerequisites

- Node.js version 18.0.0 or higher
- npm (Node Package Manager)

## Installation and Setup

1. Clone the repository or upload the files to your hosting server:
   ```bash
   git clone https://github.com/FTBimz/PremierFusion-Bot.git
   cd PremierFusion-Bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the root directory and configure your credentials:
   ```env
   TOKEN=your_discord_bot_token_here
   ```

4. Deploy slash commands:
   ```bash
   node deploy-commands.js
   ```

5. Start the bot:
   ```bash
   node index.js
   ```

## License

This project is open-source and available under the MIT License.
