# Aegis

Aegis is a Discord moderation bot focused on fast slash commands, clean moderation workflows, and practical server management.

It uses modern Discord interactions including slash commands, buttons, select menus, modals, and context-aware moderation flows.

## Features

- Fast top-level moderation commands like `/ban`, `/mute`, `/kick`, `/strike`, and `/purge`
- Case management with `/case view`, `/case user`, `/case edit`, `/case delete`, and `/case clear`
- User and server utility commands like `/user`, `/avatar`, `/rank`, `/server`, `/role`, `/id`, and `/leaderboard`
- Built-in `/help` command with command lookup and category help
- Built-in `/setup` command with a guided server setup checklist
- Auto-response management with `/response ...`
- Bad-word filter management with `/badword ...`
- Leveling configuration with `/level ...` and reward role management with `/levelrole ...`
- Logging, invite filtering, strike punishments, muted roles, and protected roles
- Optional YouTube and Zendesk integrations
- Optional Google Cloud Vision support for image scanning

## Command Overview

### Moderation

- `/ban`
- `/unban`
- `/kick`
- `/mute`
- `/unmute`
- `/strike`
- `/pardon`
- `/purge`
- `/lock`
- `/unlock`

### Cases

- `/case view`
- `/case user`
- `/case edit`
- `/case delete`
- `/case clear`

### Info and Utility

- `/user`
- `/avatar`
- `/rank`
- `/server`
- `/role`
- `/id`
- `/leaderboard`
- `/article`
- `/video`
- `/help`
- `/setup`
- `/info`

### Configuration

- `/settings overview`
- `/settings log-channel`
- `/settings message-log`
- `/settings join-log`
- `/settings punishments show`
- `/settings punishments set`
- `/settings protected-roles add`
- `/settings protected-roles remove`
- `/settings protected-roles list`
- `/settings muted-role create`
- `/settings muted-role set`
- `/settings muted-role disable`
- `/settings spam`
- `/settings caps`
- `/settings similar-messages`
- `/settings link-cool-down`
- `/settings attachment-cool-down`
- `/settings invites show`
- `/settings invites set`
- `/settings help-center`
- `/settings playlist`
- `/safe-search`
- `/response add`
- `/response list`
- `/response view`
- `/response edit`
- `/response remove`
- `/badword add`
- `/badword list`
- `/badword view`
- `/badword edit`
- `/badword remove`
- `/level view`
- `/level set`
- `/level channel`
- `/level set-user`
- `/levelrole set`
- `/levelrole remove`
- `/levelrole list`

## Getting Started

### Requirements

- Node.js 22 or newer
- MySQL or MariaDB
- A Discord application with a bot user

### Setup

1. Create a Discord application in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a bot user and copy the bot token.
3. Enable the required gateway intents:
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`
4. Create a MySQL or MariaDB database for Aegis.
5. Configure the bot using [CONFIGURATION.md](./CONFIGURATION.md).
6. Install dependencies with `npm ci`.
7. Start the bot with `npm start`.

### Development

- Start normally: `npm start`
- Start with auto-reload: `npm run dev`
- Run linting: `npm run lint`

## Invite URL

Replace `YOUR_CLIENT_ID` with your Discord application client ID:

```text
https://discord.com/oauth2/authorize?client_id=1504499616534761483&scope=bot%20applications.commands&permissions=1099780074646
```

## Self-Hosting

### Local Install

```bash
npm ci
npm start
```

### Docker

Example:

```bash
docker run \
  -e AEGIS_AUTH_TOKEN="<discord-auth-token>" \
  -e AEGIS_DATABASE_HOST="<database-host>" \
  -e AEGIS_DATABASE_PASSWORD="<database-password>" \
  aegis
```

If you publish your own image, replace `aegis` with your image name.

## Configuration Notes

Aegis supports:

- `config.json`
- environment variables

Important configuration areas:

- Discord bot token
- database connection
- optional Google API key for YouTube features
- optional Google Cloud Vision and Logging
- optional feature whitelist
- optional custom emoji IDs

Full configuration details and examples are in [CONFIGURATION.md](./CONFIGURATION.md).

## Recommended First-Time Setup

After inviting the bot:

1. Run `/setup`
2. Run `/settings overview`
3. Set a moderation log channel with `/settings log-channel`
4. Configure message logs with `/settings message-log`
5. Configure join logs with `/settings join-log`
6. Set strike punishments with `/settings punishments set`
7. Configure bad-word filters or auto-responses if needed
8. Configure leveling with `/level set` and `/levelrole set` if you use XP roles

## Project Structure

- [src/index.js](./src/index.js) starts the bot
- [src/commands](./src/commands) contains slash commands and interaction handlers
- [src/events](./src/events) contains Discord and REST event listeners
- [src/database](./src/database) contains database models, schema, and migrations
- [src/settings](./src/settings) contains guild and user settings logic

## Security

If you are running this bot in production, review [SECURITY.md](./SECURITY.md).

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
