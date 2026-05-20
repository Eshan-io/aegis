import SubCommand from '../../SubCommand.js';
import GuildSettings from '../../../settings/GuildSettings.js';
import LineEmbed from '../../../formatting/embeds/LineEmbed.js';
import GuildWrapper from '../../../discord/GuildWrapper.js';
import {roleMention} from 'discord.js';

export default class ListLevelingRolesCommand extends SubCommand {
    async execute(interaction) {
        const guildSettings = await GuildSettings.get(interaction.guildId);
        const embed = new LineEmbed()
            .setTitle('Leveling reward roles')
            .setDescription('This server has no leveling reward roles configured.');
        const guild = new GuildWrapper(interaction.guild);

        const validRewards = [];
        for (const reward of guildSettings.getLevelingRewardEntries()) {
            if (await guild.fetchRole(reward.roleid)) {
                validRewards.push(reward);
                embed.addLine(`- Level ${reward.level}: ${roleMention(reward.roleid)}`);
            }
        }

        if (validRewards.length !== guildSettings.getLevelingRewardEntries().length) {
            guildSettings.leveling = {
                ...guildSettings.leveling,
                rewards: validRewards,
            };
            await guildSettings.save();
        }

        await interaction.reply(embed.toMessage());
    }

    getDescription() {
        return 'List leveling reward roles';
    }

    getName() {
        return 'list-roles';
    }
}
