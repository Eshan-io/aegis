import Command from '../Command.js';
import Level from '../../database/Level.js';
import {AttachmentBuilder, userMention} from 'discord.js';
import {buildRankCard} from './RankCard.js';
import logger from '../../bot/Logger.js';
import {deferReplyOnce} from '../../util/interaction.js';
import {getCurrentLevelingRewardRole} from '../../leveling/LevelingRoleRewards.js';
import GuildSettings from '../../settings/GuildSettings.js';

export default class RankCommand extends Command {
    buildOptions(builder) {
        builder.addUserOption(option => option
            .setName('user')
            .setDescription('User to show the rank for')
        );
        return super.buildOptions(builder);
    }

    supportsUserCommands() {
        return true;
    }

    async execute(interaction) {
        const user = interaction.options.getUser('user') ?? interaction.user;
        await deferReplyOnce(interaction);
        await interaction.editReply(await this.getMessage(interaction, user));
    }

    async executeUserMenu(interaction) {
        await deferReplyOnce(interaction);
        await interaction.editReply(await this.getMessage(interaction, interaction.targetUser));
    }

    /**
     * @param {import('discord.js').ChatInputCommandInteraction|import('discord.js').UserContextMenuCommandInteraction} interaction
     * @param {import('discord.js').User} user
     * @returns {Promise<import('discord.js').InteractionEditReplyOptions>}
     */
    async getMessage(interaction, user) {
        const level = await Level.get(interaction.guildId, user.id);
        const member = interaction.guild?.members?.cache?.get(user.id)
            ?? await interaction.guild?.members.fetch(user.id).catch(() => null);
        const guildSettings = await GuildSettings.get(interaction.guildId);
        const rewardRole = await getCurrentLevelingRewardRole(guildSettings, interaction.guild, level.level);

        try {
            const image = await buildRankCard(user, member ?? null, level, rewardRole?.name ?? 'No role');

            return {
                files: [
                    new AttachmentBuilder(image, {
                        name: 'rank-card.png',
                        description: `Rank card for ${user.tag}`,
                    }),
                ],
            };
        } catch (error) {
            await logger.warn(`Failed to render rank card for ${user.id}`, error);
            return {
                content:
                    `${userMention(user.id)} is level **${level.level}**.\n` +
                    `Reward role: ${rewardRole?.name ?? 'None'}\n` +
                    `XP: ${level.xp}/${level.xpToNextLevel}\n` +
                    `Total XP: ${level.totalXp}`,
            };
        }
    }

    getDescription() {
        return 'Show the current level and XP for a user';
    }

    getName() {
        return 'rank';
    }
}
