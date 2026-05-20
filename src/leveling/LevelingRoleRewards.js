import {RESTJSONErrorCodes} from 'discord.js';
import logger from '../bot/Logger.js';
import Level from '../database/Level.js';

/**
 * @param {import('../settings/GuildSettings.js').default} guildSettings
 * @param {import('discord.js').Guild} guild
 * @param {number} level
 * @returns {Promise<?import('discord.js').Role>}
 */
export async function getCurrentLevelingRewardRole(guildSettings, guild, level) {
    const roleId = guildSettings.getLevelingRewardRole(level);
    if (!roleId) {
        return null;
    }

    try {
        return await guild.roles.fetch(roleId);
    } catch (error) {
        if ([RESTJSONErrorCodes.UnknownRole, RESTJSONErrorCodes.MissingAccess].includes(error.code)) {
            return null;
        }
        throw error;
    }
}

/**
 * @param {import('../settings/GuildSettings.js').default} guildSettings
 * @param {import('discord.js').GuildMember} member
 * @param {number} level
 * @param {import('discord.js').Snowflake[]} [extraRoleIds]
 * @returns {Promise<void>}
 */
export async function syncLevelingRewardRoles(guildSettings, member, level, extraRoleIds = []) {
    const rewardRoleIds = Array.from(new Set([...guildSettings.getLevelingRewardRoleIds(), ...extraRoleIds]));
    if (!rewardRoleIds.length) {
        return;
    }

    const currentRewardRoleId = guildSettings.getLevelingRewardRole(level);
    const rolesToRemove = rewardRoleIds.filter(roleId => roleId !== currentRewardRoleId && member.roles.cache.has(roleId));

    if (rolesToRemove.length) {
        try {
            await member.roles.remove(rolesToRemove);
        } catch (error) {
            if ([RESTJSONErrorCodes.MissingPermissions, RESTJSONErrorCodes.MissingAccess, RESTJSONErrorCodes.UnknownRole].includes(error.code)) {
                await logger.warn(`Failed to remove outdated leveling reward roles from ${member.user.id} in guild ${member.guild.id}`, error);
            } else {
                throw error;
            }
        }
    }

    if (!currentRewardRoleId || member.roles.cache.has(currentRewardRoleId)) {
        return;
    }

    try {
        await member.roles.add(currentRewardRoleId);
    } catch (error) {
        if ([RESTJSONErrorCodes.MissingPermissions, RESTJSONErrorCodes.MissingAccess, RESTJSONErrorCodes.UnknownRole].includes(error.code)) {
            await logger.warn(`Failed to add leveling reward role ${currentRewardRoleId} to ${member.user.id} in guild ${member.guild.id}`, error);
            return;
        }
        throw error;
    }
}

/**
 * @param {import('../settings/GuildSettings.js').default} guildSettings
 * @param {import('discord.js').Guild} guild
 * @param {import('discord.js').Snowflake[]} [extraRoleIds]
 * @returns {Promise<void>}
 */
export async function resyncGuildLevelingRewardRoles(guildSettings, guild, extraRoleIds = []) {
    const levels = await Level.getAll(guild.id);
    for (const level of levels) {
        const member = await guild.members.fetch(level.userid).catch(() => null);
        if (!member) {
            continue;
        }

        await syncLevelingRewardRoles(guildSettings, member, level.level, extraRoleIds);
    }
}
