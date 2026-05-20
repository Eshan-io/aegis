import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    PermissionsBitField,
} from 'discord.js';
import Command from '../Command.js';
import colors from '../../util/colors.js';
import EmbedWrapper from '../../formatting/embeds/EmbedWrapper.js';

const SETUP_SECTIONS = {
    overview: {
        title: 'Setup Guide',
        description: 'Use this guide to get Aegis ready in a new server.',
        fields: [
            {
                name: '1. Logs',
                value: 'Start with `/settings log-channel`, `/settings message-log`, and `/settings join-log`.',
            },
            {
                name: '2. Moderation',
                value: 'Configure strike punishments with `/settings punishments set` and set a muted role with `/settings muted-role set` or `/settings muted-role create`.',
            },
            {
                name: '3. Filters',
                value: 'Set anti-spam with `/settings spam`, `/settings caps`, `/settings similar-messages`, `/settings invites set`, `/safe-search`, `/badword add`, and `/response add`.',
            },
            {
                name: '4. Leveling',
                value: 'Enable XP with `/level set`, then configure rewards with `/levelrole set`.',
            },
            {
                name: '5. Integrations',
                value: 'Optional: connect `/settings help-center` and `/settings playlist` to unlock `/article` and `/video`.',
            },
        ],
    },
    logs: {
        title: 'Setup: Logs',
        description: 'Recommended logging commands for a new server.',
        fields: [
            {name: 'Moderation Log', value: '`/settings log-channel channel:<channel>`'},
            {name: 'Message Log', value: '`/settings message-log channel:<channel>`'},
            {name: 'Join/Leave Log', value: '`/settings join-log channel:<channel>`'},
            {name: 'Check Result', value: 'Run `/settings overview` after setup to confirm everything.'},
        ],
    },
    moderation: {
        title: 'Setup: Moderation',
        description: 'Set the defaults moderators will rely on every day.',
        fields: [
            {name: 'Strike Punishments', value: '`/settings punishments set count:<number> action:<action>`'},
            {name: 'Muted Role', value: '`/settings muted-role create` or `/settings muted-role set role:<role>`'},
            {name: 'Protected Roles', value: '`/settings protected-roles add role:<role>`'},
            {name: 'Verify Workflow', value: 'Use `/help category:moderation` to review the live moderation commands.'},
        ],
    },
    filters: {
        title: 'Setup: Filters',
        description: 'Configure automatic protection before the server gets busy.',
        fields: [
            {name: 'Spam Controls', value: '`/settings spam`, `/settings caps`, `/settings similar-messages`'},
            {name: 'Links and Attachments', value: '`/settings link-cool-down`, `/settings attachment-cool-down`, `/settings invites set`'},
            {name: 'Bad Words', value: '`/badword add` then `/badword list`'},
            {name: 'Auto Responses', value: '`/response add` then `/response list`'},
            {name: 'Image Scanning', value: '`/safe-search enabled:true` if Google Cloud Vision is configured.'},
        ],
    },
    leveling: {
        title: 'Setup: Leveling',
        description: 'Optional XP and reward role setup.',
        fields: [
            {name: 'Enable Leveling', value: '`/level set enabled:true announce:true cooldown:<seconds>`'},
            {name: 'Announcement Channel', value: '`/level channel channel:<channel>`'},
            {name: 'Reward Roles', value: '`/levelrole set level:<number> role:<role>`'},
            {name: 'Review Setup', value: '`/level view` and `/levelrole list`'},
        ],
    },
    integrations: {
        title: 'Setup: Integrations',
        description: 'Optional external content sources.',
        fields: [
            {name: 'Help Center', value: '`/settings help-center domain:<domain>`'},
            {name: 'Article Search', value: 'Once configured, moderators can use `/article query:<text>`.'},
            {name: 'Video Playlist', value: '`/settings playlist url:<playlist-url>`'},
            {name: 'Video Search', value: 'Once configured, users can use `/video query:<text>`.'},
        ],
    },
};

export default class SetupCommand extends Command {
    buildOptions(builder) {
        builder.addStringOption(option => option
            .setName('section')
            .setDescription('Part of the setup guide to open')
            .setRequired(false)
            .addChoices(
                {name: 'Overview', value: 'overview'},
                {name: 'Logs', value: 'logs'},
                {name: 'Moderation', value: 'moderation'},
                {name: 'Filters', value: 'filters'},
                {name: 'Leveling', value: 'leveling'},
                {name: 'Integrations', value: 'integrations'},
            ));
        return super.buildOptions(builder);
    }

    getDefaultMemberPermissions() {
        return new PermissionsBitField()
            .add(PermissionFlagsBits.ManageGuild);
    }

    async execute(interaction) {
        const section = interaction.options.getString('section') ?? 'overview';
        await interaction.reply(this.buildSectionMessage(section));
    }

    async executeButton(interaction) {
        const section = interaction.customId.split(':')[1] ?? 'overview';
        await interaction.update(this.buildSectionMessage(section));
    }

    buildSectionMessage(section) {
        const data = SETUP_SECTIONS[section] ?? SETUP_SECTIONS.overview;
        const embed = new EmbedWrapper()
            .setColor(colors.GREEN)
            .setTitle(data.title)
            .setDescription(data.description);

        for (const field of data.fields) {
            embed.addFields({
                name: field.name,
                value: field.value,
                inline: false,
            });
        }

        return {
            ...embed.toMessage(),
            components: this.buildButtons(section),
        };
    }

    buildButtons(active) {
        return [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Overview')
                    .setStyle(active === 'overview' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setCustomId('setup:overview'),
                new ButtonBuilder()
                    .setLabel('Logs')
                    .setStyle(active === 'logs' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setCustomId('setup:logs'),
                new ButtonBuilder()
                    .setLabel('Moderation')
                    .setStyle(active === 'moderation' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setCustomId('setup:moderation'),
                new ButtonBuilder()
                    .setLabel('Filters')
                    .setStyle(active === 'filters' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setCustomId('setup:filters'),
                new ButtonBuilder()
                    .setLabel('Leveling')
                    .setStyle(active === 'leveling' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setCustomId('setup:leveling'),
            ),
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Integrations')
                    .setStyle(active === 'integrations' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setCustomId('setup:integrations'),
            ),
        ];
    }

    getDescription() {
        return 'Open a guided setup checklist for this server';
    }

    getName() {
        return 'setup';
    }
}
