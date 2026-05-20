import {ModalBuilder} from "discord.js";

export default class BetterModalBuilder extends ModalBuilder {
    /**
     * @param {import('discord.js').APILabelComponent|import('discord.js').LabelBuilder} label
     * @returns {this}
     */
    addLabelComponent(label) {
        this.addLabelComponents(
            // eslint-disable-next-line jsdoc/reject-any-type
            /** @type {*} */
            label
        );
        return this;
    }
}
