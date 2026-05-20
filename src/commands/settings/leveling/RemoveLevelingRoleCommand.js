import SubCommand from '../../SubCommand.js';
import GuildSettings from '../../../settings/GuildSettings.js';
import EmbedWrapper from '../../../formatting/embeds/EmbedWrapper.js';
import colors from '../../../util/colors.js';
import {roleMention} from 'discord.js';
import {deferReplyOnce} from '../../../util/interaction.js';
import {resyncGuildLevelingRewardRoles} from '../../../leveling/LevelingRoleRewards.js';

export default class RemoveLevelingRoleCommand extends SubCommand {
    buildOptions(builder) {
        builder
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Reward role to remove')
            )
            .addIntegerOption(option => option
                .setName('level')
                .setDescription('Reward level to remove')
                .setMinValue(1)
                .setMaxValue(1000)
            );
        return super.buildOptions(builder);
    }

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const level = interaction.options.getInteger('level');
        const guildSettings = await GuildSettings.get(interaction.guildId);
        const rewards = guildSettings.getLevelingRewardEntries();

        if (!role && level === null) {
            await interaction.reply(new EmbedWrapper()
                .setColor(colors.RED)
                .setDescription('Provide a role or level to remove.')
                .toMessage());
            return;
        }

        await deferReplyOnce(interaction);
        const previousRoleIds = guildSettings.getLevelingRewardRoleIds();
        const nextRewards = rewards.filter(reward => {
            if (role && reward.roleid === role.id) {
                return false;
            }
            if (level !== null && reward.level === level) {
                return false;
            }
            return true;
        });

        if (nextRewards.length === rewards.length) {
            await interaction.reply(new EmbedWrapper()
                .setColor(colors.RED)
                .setDescription('No matching leveling reward role was configured.')
                .toMessage());
            return;
        }

        guildSettings.leveling = {
            ...guildSettings.leveling,
            rewards: nextRewards,
        };
        await guildSettings.save();
        await resyncGuildLevelingRewardRoles(guildSettings, interaction.guild, previousRoleIds);

        const target = role ? roleMention(role.id) : `level **${level}**`;
        await interaction.editReply({
            embeds: [new EmbedWrapper()
                .setColor(colors.GREEN)
                .setDescription(`Removed the leveling reward for ${target}.`)],
        });
    }

    getDescription() {
        return 'Remove a leveling reward role';
    }

    getName() {
        return 'remove-role';
    }
}
