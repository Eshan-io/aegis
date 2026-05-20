export const HELP_CATEGORIES = [
    {
        id: 'moderation',
        label: 'Moderation',
        description: 'Fast top-level actions for moderators.',
        commands: [
            {name: 'ban', usage: '/ban user:<user> reason:<text> duration:<time> delete-message-history:<time>', description: 'Ban a user.'},
            {name: 'unban', usage: '/unban user:<user> reason:<text>', description: 'Unban a user.'},
            {name: 'kick', usage: '/kick user:<user> reason:<text>', description: 'Kick a user.'},
            {name: 'mute', usage: '/mute user:<user> duration:<time> reason:<text>', description: 'Mute a user.'},
            {name: 'unmute', usage: '/unmute user:<user> reason:<text>', description: 'Unmute a user.'},
            {name: 'strike', usage: '/strike user:<user> count:<number> reason:<text>', description: 'Strike a user and apply configured punishments.'},
            {name: 'pardon', usage: '/pardon user:<user> count:<number> reason:<text>', description: 'Remove strikes from a user.'},
            {name: 'purge', usage: '/purge limit:<number> user:<user> regex:<pattern>', description: 'Bulk delete matching messages.'},
            {name: 'lock', usage: '/lock channels:<current|all> reason:<text>', description: 'Lock one or more channels.'},
            {name: 'unlock', usage: '/unlock channels:<current|all>', description: 'Unlock channels previously locked by the bot.'},
        ],
    },
    {
        id: 'cases',
        label: 'Cases',
        description: 'View and manage moderation history.',
        commands: [
            {name: 'case view', usage: '/case view id:<case-id>', description: 'Open a single moderation case.'},
            {name: 'case user', usage: '/case user user:<user>', description: 'List moderation cases for a user.'},
            {name: 'case edit', usage: '/case edit id:<case-id> ...', description: 'Edit a moderation case.'},
            {name: 'case delete', usage: '/case delete id:<case-id>', description: 'Delete a single case.'},
            {name: 'case clear', usage: '/case clear user:<user>', description: 'Delete all cases for a user.'},
        ],
    },
    {
        id: 'info',
        label: 'Info',
        description: 'Lookup commands for users, roles, and the server.',
        commands: [
            {name: 'user', usage: '/user user:<user>', description: 'Show information about a user.'},
            {name: 'avatar', usage: '/avatar user:<user>', description: 'Show a user avatar.'},
            {name: 'rank', usage: '/rank user:<user>', description: 'Show a user level and XP.'},
            {name: 'server', usage: '/server', description: 'Show server information.'},
            {name: 'role', usage: '/role role:<role>', description: 'Show role information.'},
            {name: 'id', usage: '/id query:<text>', description: 'Search users in the member and ban lists.'},
            {name: 'leaderboard', usage: '/leaderboard', description: 'Show the leveling leaderboard.'},
            {name: 'info', usage: '/info', description: 'Show bot information.'},
        ],
    },
    {
        id: 'filters',
        label: 'Filters',
        description: 'Bad-word and auto-response systems.',
        commands: [
            {name: 'badword add', usage: '/badword add', description: 'Create a bad-word filter.'},
            {name: 'badword view', usage: '/badword view id:<id>', description: 'View a bad-word filter.'},
            {name: 'badword edit', usage: '/badword edit id:<id>', description: 'Edit a bad-word filter.'},
            {name: 'badword remove', usage: '/badword remove id:<id>', description: 'Remove a bad-word filter.'},
            {name: 'badword list', usage: '/badword list', description: 'List all bad-word filters.'},
            {name: 'response add', usage: '/response add', description: 'Create an auto-response.'},
            {name: 'response view', usage: '/response view id:<id>', description: 'View an auto-response.'},
            {name: 'response edit', usage: '/response edit id:<id>', description: 'Edit an auto-response.'},
            {name: 'response remove', usage: '/response remove id:<id>', description: 'Remove an auto-response.'},
            {name: 'response list', usage: '/response list', description: 'List all auto-responses.'},
        ],
    },
    {
        id: 'settings',
        label: 'Settings',
        description: 'Core guild configuration and moderation defaults.',
        commands: [
            {name: 'settings overview', usage: '/settings overview', description: 'Show the full settings overview.'},
            {name: 'settings log-channel', usage: '/settings log-channel channel:<channel>', description: 'Set the main moderation log channel.'},
            {name: 'settings message-log', usage: '/settings message-log channel:<channel>', description: 'Set the deleted/edited message log channel.'},
            {name: 'settings join-log', usage: '/settings join-log channel:<channel>', description: 'Set the join/leave log channel.'},
            {name: 'settings punishments set', usage: '/settings punishments set count:<number> action:<action>', description: 'Configure strike punishments.'},
            {name: 'settings muted-role set', usage: '/settings muted-role set role:<role>', description: 'Set the muted role.'},
            {name: 'settings protected-roles add', usage: '/settings protected-roles add role:<role>', description: 'Protect a role from moderation actions.'},
            {name: 'settings invites set', usage: '/settings invites set mode:<allowed|forbidden|default>', description: 'Control invite posting.'},
            {name: 'safe-search', usage: '/safe-search enabled:<true|false>', description: 'Configure image scanning using Google Cloud Vision.'},
        ],
    },
    {
        id: 'leveling',
        label: 'Leveling',
        description: 'XP and role reward setup.',
        commands: [
            {name: 'level view', usage: '/level view', description: 'View current leveling settings.'},
            {name: 'level set', usage: '/level set enabled:<true|false> ...', description: 'Update leveling behavior.'},
            {name: 'level channel', usage: '/level channel channel:<channel>', description: 'Set the level-up announcement channel.'},
            {name: 'level set-user', usage: '/level set-user user:<user> level:<number> xp:<number>', description: 'Set a user level and XP.'},
            {name: 'levelrole set', usage: '/levelrole set level:<number> role:<role>', description: 'Add or replace a reward role.'},
            {name: 'levelrole remove', usage: '/levelrole remove role:<role>|level:<number>', description: 'Remove a reward role.'},
            {name: 'levelrole list', usage: '/levelrole list', description: 'List reward roles.'},
        ],
    },
    {
        id: 'integrations',
        label: 'Integrations',
        description: 'External content and data management.',
        commands: [
            {name: 'article', usage: '/article query:<text>', description: 'Search the configured Zendesk help center.'},
            {name: 'video', usage: '/video query:<text>', description: 'Search videos from the configured playlist.'},
            {name: 'settings help-center', usage: '/settings help-center domain:<domain>', description: 'Set the Zendesk help center domain.'},
            {name: 'settings playlist', usage: '/settings playlist url:<url>', description: 'Set the YouTube playlist for /video.'},
            {name: 'import', usage: '/import', description: 'Import exported moderation data.'},
            {name: 'export', usage: '/export', description: 'Export all stored guild data.'},
        ],
    },
];

export const HELP_COMMANDS = HELP_CATEGORIES.flatMap(category => category.commands);

/**
 * @param {string} id
 * @returns {?{id: string, label: string, description: string, commands: {name: string, usage: string, description: string}[]}}
 */
export function findHelpCategory(id) {
    return HELP_CATEGORIES.find(category => category.id === id) ?? null;
}

/**
 * @param {string} name
 * @returns {?{name: string, usage: string, description: string}}
 */
export function findHelpCommand(name) {
    const normalized = name.trim().toLowerCase();
    return HELP_COMMANDS.find(command => command.name === normalized) ?? null;
}
