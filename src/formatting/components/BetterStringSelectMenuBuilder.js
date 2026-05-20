import {StringSelectMenuBuilder} from "discord.js";

export default class BetterStringSelectMenuBuilder extends StringSelectMenuBuilder {
    /**
     * @param {import('discord.js').APISelectMenuOption|import('discord.js').StringSelectMenuOptionBuilder} option
     * @returns {this}
     */
    addOption(option) {
        this.addOptions(
            // eslint-disable-next-line jsdoc/reject-any-type
            /** @type {*} */
            option
        );
        return this;
    }
}
