import {CheckboxGroupBuilder} from "discord.js";

export default class BetterCheckboxGroupBuilder extends CheckboxGroupBuilder {
    /**
     * @param {import('discord.js').APICheckboxGroupOption | import('discord.js').CheckboxGroupOptionBuilder} option
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
