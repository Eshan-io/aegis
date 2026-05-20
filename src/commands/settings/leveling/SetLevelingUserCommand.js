import SubCommand from '../../SubCommand.js';
import ErrorEmbed from '../../../formatting/embeds/ErrorEmbed.js';
import EmbedWrapper from '../../../formatting/embeds/EmbedWrapper.js';
import colors from '../../../util/colors.js';
import Level from '../../../database/Level.js';
import GuildSettings from '../../../settings/GuildSettings.js';
import {syncLevelingRewardRoles} from '../../../leveling/LevelingRoleRewards.js';
import {userMention} from 'discord.js';

export default class SetLevelingUserCommand extends SubCommand {
    buildOptions(builder) {
        builder
            .addUserOption(option => option
                .setName('user')
                .setDescription('User whose level data should be changed')
                .setRequired(true)
            )
            .addIntegerOption(option => option
                .setName('level')
                .setDescription('Target level')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(1000)
            )
            .addIntegerOption(option => option
                .setName('xp')
                .setDescription('Current XP toward the next level')
                .setMinValue(0)
                .setMaxValue(1000000)
            );
        return super.buildOptions(builder);
    }

    async execute(interaction) {
        const user = interaction.options.getUser('user', true);
        const targetLevel = interaction.options.getInteger('level', true);
        const xp = interaction.options.getInteger('xp') ?? 0;
        const xpLimit = Level.xpForNextLevel(targetLevel);

        if (xp >= xpLimit) {
            await interaction.reply(ErrorEmbed.message(`XP must be below ${xpLimit} for level ${targetLevel}.`));
            return;
        }

        const level = await Level.get(interaction.guildId, user.id);
        level.level = targetLevel;
        level.xp = xp;
        level.lastMessage = Math.floor(Date.now() / 1000);
        await level.save();

        const member = interaction.guild.members.cache.get(user.id)
            ?? await interaction.guild.members.fetch(user.id).catch(() => null);
        if (member) {
            const guildSettings = await GuildSettings.get(interaction.guildId);
            await syncLevelingRewardRoles(guildSettings, member, level.level);
        }

        await interaction.reply(new EmbedWrapper()
            .setColor(colors.GREEN)
            .setDescription(
                `Set ${userMention(user.id)} to level **${level.level}** with **${level.xp}/${level.xpToNextLevel} XP**.`
            )
            .toMessage());
    }

    getDescription() {
        return 'Testing: set a user\'s level and XP';
    }

    getName() {
        return 'set-user';
    }
}
