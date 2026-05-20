import SubCommand from '../../SubCommand.js';
import GuildSettings from '../../../settings/GuildSettings.js';
import EmbedWrapper from '../../../formatting/embeds/EmbedWrapper.js';
import colors from '../../../util/colors.js';
import {channelMention, roleMention} from 'discord.js';

/**
 * @param {import('../../../settings/GuildSettings.js').default} guildSettings
 * @returns {{flags: number, embeds: EmbedWrapper[]}}
 */
export function getEmbed(guildSettings) {
    const {leveling} = guildSettings;
    const rewards = guildSettings.getLevelingRewardEntries();
    const embed = new EmbedWrapper()
        .setTitle('Leveling')
        .setColor(leveling.enabled ? colors.GREEN : colors.ORANGE)
        .setDescription(
            `Leveling is currently ${leveling.enabled ? 'enabled' : 'disabled'}.\n` +
            `Announcements: ${leveling.announce ? 'enabled' : 'disabled'}\n` +
            `Announcement channel: ${leveling.channel ? channelMention(leveling.channel) : 'same channel'}\n` +
            `XP cooldown: ${leveling.cooldown} seconds\n` +
            `XP per message: ${leveling.minXp}-${leveling.maxXp}\n` +
            `Reward roles: ${rewards.length ? rewards.map(reward => `Lvl ${reward.level}: ${roleMention(reward.roleid)}`).join(', ') : 'none'}`
        );

    return embed.toMessage();
}

export default class ShowLevelingCommand extends SubCommand {
    async execute(interaction) {
        const guildSettings = await GuildSettings.get(interaction.guildId);
        await interaction.reply(getEmbed(guildSettings));
    }

    getDescription() {
        return 'Show the current leveling settings';
    }

    getName() {
        return 'show';
    }
}
