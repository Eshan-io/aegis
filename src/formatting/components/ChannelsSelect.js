import {ChannelType, LabelBuilder} from "discord.js";
import {SELECT_MENU_OPTIONS_LIMIT} from "../../util/apiLimits.js";
import BetterChannelSelectMenuBuilder from "./BetterChannelSelectMenuBuilder.js";

export default class ChannelsSelect extends LabelBuilder {
    /**
     * @param {import('../../commands/SubCommand.js').default} command
     * @param {?import('../../database/ChatTriggeredFeature.js').default} existing
     */
    constructor(command, existing = null) {
        super();
        this.setLabel("Channels")
            .setDescription("The channels this " + command.getTopLevelParent().getName() + " applies to")
            .setChannelSelectMenuComponent(
                new BetterChannelSelectMenuBuilder()
                    .addChannelTypes([
                        ChannelType.GuildText,
                        ChannelType.GuildForum,
                        ChannelType.GuildAnnouncement,
                        ChannelType.GuildStageVoice,
                    ])
                    .setMinValues(1)
                    .setMaxValues(SELECT_MENU_OPTIONS_LIMIT)
                    .setCustomId(`channels`)
                    .setDefaultChannels(existing?.channels ?? [])
            );
    }
}
