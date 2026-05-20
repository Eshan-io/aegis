import {channelMention} from 'discord.js';
import GuildSettings from '../../../settings/GuildSettings.js';
import AbstractChannelCommand from '../AbstractChannelCommand.js';
import EmbedWrapper from '../../../formatting/embeds/EmbedWrapper.js';
import colors from '../../../util/colors.js';

export default class SetLevelingChannelCommand extends AbstractChannelCommand {
    buildOptions(builder) {
        builder.addChannelOption(option => option
            .setName('channel')
            .setDescription('Channel used for level-up announcements')
            .setRequired(false)
        );
        return super.buildOptions(builder);
    }

    async execute(interaction) {
        const channel = await this.getChannel(interaction);
        if (channel === false) {
            return;
        }

        const guildSettings = await GuildSettings.get(interaction.guildId);
        guildSettings.leveling = {
            ...guildSettings.leveling,
            channel: channel?.id ?? null,
        };
        await guildSettings.save();

        const embed = new EmbedWrapper();
        if (channel) {
            embed
                .setDescription(`Set the leveling announcement channel to ${channelMention(channel.id)}.`)
                .setColor(colors.GREEN);
        } else {
            embed
                .setDescription('Level-up announcements will be sent in the same channel again.')
                .setColor(colors.ORANGE);
        }

        await interaction.reply(embed.toMessage());
    }

    getDescription() {
        return 'Set the channel used for level-up announcements';
    }

    getName() {
        return 'channel';
    }
}
