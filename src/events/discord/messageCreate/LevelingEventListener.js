import MessageCreateEventListener from './MessageCreateEventListener.js';
import GuildSettings from '../../../settings/GuildSettings.js';
import Level from '../../../database/Level.js';
import {RESTJSONErrorCodes} from 'discord.js';
import logger from '../../../bot/Logger.js';
import {syncLevelingRewardRoles} from '../../../leveling/LevelingRoleRewards.js';
import GuildWrapper from '../../../discord/GuildWrapper.js';

export default class LevelingEventListener extends MessageCreateEventListener {
    /**
     * @param {import('discord.js').Message} message
     * @returns {Promise<void>}
     */
    async execute(message) {
        if (!message.guild || message.author.bot || message.system) {
            return;
        }

        const guildSettings = await GuildSettings.get(message.guild.id);
        if (!guildSettings.leveling.enabled) {
            return;
        }

        const now = Math.floor(message.createdTimestamp / 1000);
        const level = await Level.get(message.guild.id, message.author.id);
        if (level.lastMessage && level.lastMessage + guildSettings.leveling.cooldown > now) {
            return;
        }

        const min = guildSettings.leveling.minXp;
        const max = guildSettings.leveling.maxXp;
        const amount = Math.floor(Math.random() * (max - min + 1)) + min;
        const levelUps = level.addXp(amount, now);
        await level.save();
        await syncLevelingRewardRoles(guildSettings, message.member, level.level);

        if (!levelUps || !guildSettings.leveling.announce) {
            return;
        }

        try {
            const content = `${message.author} You reached level ${level.level}!`;
            if (guildSettings.leveling.channel) {
                await new GuildWrapper(message.guild).sendMessageToChannel(guildSettings.leveling.channel, {content});
            } else {
                await message.reply(content);
            }
        } catch (e) {
            if (e.code === RESTJSONErrorCodes.MissingPermissions) {
                const channel = /** @type {import('discord.js').GuildTextBasedChannel} */ message.channel;
                await logger.warn(`Missing permissions to announce level-up in channel ${channel?.name} (${message.channelId}) of guild ${message.guild?.name} (${message.guildId})`, e);
                return;
            }
            throw e;
        }
    }
}
