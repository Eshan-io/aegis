import SubCommand from '../../SubCommand.js';
import GuildSettings from '../../../settings/GuildSettings.js';
import ErrorEmbed from '../../../formatting/embeds/ErrorEmbed.js';
import EmbedWrapper from '../../../formatting/embeds/EmbedWrapper.js';
import colors from '../../../util/colors.js';
import {roleMention} from 'discord.js';
import {deferReplyOnce} from '../../../util/interaction.js';
import {resyncGuildLevelingRewardRoles} from '../../../leveling/LevelingRoleRewards.js';

export default class AddLevelingRoleCommand extends SubCommand {
    buildOptions(builder) {
        builder
            .addIntegerOption(option => option
                .setName('level')
                .setDescription('Level required to receive the role')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(1000)
            )
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Role granted at this level')
                .setRequired(true)
            );
        return super.buildOptions(builder);
    }

    async execute(interaction) {
        const level = interaction.options.getInteger('level', true);
        const role = interaction.options.getRole('role', true);
        if (!role.editable) {
            await interaction.reply(ErrorEmbed.message('I can\'t manage that role.'));
            return;
        }

        await deferReplyOnce(interaction);
        const guildSettings = await GuildSettings.get(interaction.guildId);
        const previousRoleIds = guildSettings.getLevelingRewardRoleIds();
        const rewards = guildSettings.getLevelingRewardEntries()
            .filter(reward => reward.roleid !== role.id && reward.level !== level);

        rewards.push({level, roleid: role.id});
        guildSettings.leveling = {
            ...guildSettings.leveling,
            rewards: rewards.sort((a, b) => a.level - b.level),
        };
        await guildSettings.save();
        await resyncGuildLevelingRewardRoles(guildSettings, interaction.guild, previousRoleIds);

        await interaction.editReply({
            embeds: [new EmbedWrapper()
                .setColor(colors.GREEN)
                .setDescription(`Users now receive ${roleMention(role.id)} at level **${level}**.`)],
        });
    }

    getDescription() {
        return 'Add or replace a leveling reward role';
    }

    getName() {
        return 'add-role';
    }
}
