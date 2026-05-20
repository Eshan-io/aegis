import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class ResponseInput extends LabelBuilder {
    /**
     * @param {boolean} required
     * @param {import('../../database/AutoResponse.js').default|import('../../database/BadWord.js').default|null} existing
     */
    constructor(required, existing = null) {
        super();

        const input = new TextInputBuilder()
            .setRequired(required)
            .setCustomId('response')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Hi there :wave:')
            .setMinLength(1)
            .setMaxLength(4000);

        if (existing?.response) {
            input.setValue(existing.response);
        }

        this.setLabel('Response')
            .setDescription('The response message the bot will send')
            .setTextInputComponent(input);
    }
}
