import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class MessageDeletionLimitInput extends LabelBuilder {
    constructor() {
        super();
        this.setLabel('Message deletion limit')
            .setDescription('Number of messages to delete.')
            .setTextInputComponent(new TextInputBuilder()
                .setRequired(false)
                .setCustomId('limit')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('100')
            );
    }
}
