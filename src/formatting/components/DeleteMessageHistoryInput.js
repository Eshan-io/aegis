import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class DeleteMessageHistoryInput extends LabelBuilder {
    constructor() {
        super();
        this.setLabel('Delete message history')
            .setDescription('Delete messages sent by this user within this time frame.')
            .setTextInputComponent(new TextInputBuilder()
                .setRequired(false)
                .setCustomId('delete')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('1 hour')
            );
    }
}
