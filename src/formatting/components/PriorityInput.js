import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class PriorityInput extends LabelBuilder {
    /**
     * @param {?import('../../database/BadWord.js').default} existing
     */
    constructor(existing = null) {
        super();

        const input = new TextInputBuilder()
            .setRequired(false)
            .setCustomId('priority')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('0')
            .setMinLength(1)
            .setMaxLength(10);

        if (existing?.priority) {
            input.setValue(existing.priority.toString());
        }

        this.setLabel('Priority')
            .setDescription('Priority of the bad-word. Higher priority bad-words will be checked first')
            .setTextInputComponent(input);
    }
}
