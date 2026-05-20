import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class DirectMessageInput extends LabelBuilder {
    /**
     * @param {?import('../../database/BadWord.js').default} existing
     */
    constructor(existing = null) {
        super();

        const input = new TextInputBuilder()
            .setRequired(false)
            .setCustomId('dm')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Please don't send messages like that!")
            .setMinLength(1)
            .setMaxLength(3000);

        if (existing?.dm) {
            input.setValue(existing.dm);
        }

        this.setLabel("Direct Message")
            .setDescription("An optional direct message sent to the user when their message was deleted.")
            .setTextInputComponent(input);
    }
}
