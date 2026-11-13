# PremierFusion Bot

PremierFusion is a multi-purpose Discord bot built with Node.js and Discord.js v14, featuring a complete set of moderation tools, management utilities, information queries, fun commands, web search integration, and an advanced AFK system.

## Features

- **Moderation**: Comprehensive management tools including ban, unban, kick, mute, unmute, warn, purge, and role assignment.
- **Utilities**: Announcements, custom messages, support ticketing panels, personal private notes, and custom response triggers.
- **Information**: Detailed member info, server statistics, server icons, role metadata, and avatar viewer.
- **Fun & Interaction**: Interactive giveaway management system (supporting top winner lists and random selection), dice rolling, and magic 8-ball.
- **Search & Media**: Direct web search, Google Maps location lookup, translation utilities, YouTube video search, and global weather information.
- **AFK System**: Automatic AFK status handler with nickname management, duration tracking, mention alerts, and an unlimited pagination view.

## Project Structure

```text
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
