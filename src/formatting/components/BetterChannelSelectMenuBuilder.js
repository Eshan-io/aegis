import {ChannelSelectMenuBuilder} from "discord.js";

export default class BetterChannelSelectMenuBuilder extends ChannelSelectMenuBuilder {
    // noinspection JSCheckFunctionSignatures
    /**
     * @param {import('discord.js').ChannelType[]} types
     * @returns {this}
     */
    addChannelTypes(types) {
        super.addChannelTypes(
            // eslint-disable-next-line jsdoc/reject-any-type
            /** @type {*} */
            types
        );
        return this;
    }

    // noinspection JSCheckFunctionSignatures
    /**
     * @param {import('discord.js').Snowflake[]} channels
     * @returns {this}
     */
    setDefaultChannels(channels) {
        super.setDefaultChannels(
            // eslint-disable-next-line jsdoc/reject-any-type
            /** @type {*} */
            channels
        );
        return this;
    }
}
