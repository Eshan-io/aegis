import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class StrikeCountInput extends LabelBuilder {
    /**
     * @param {string} description
     * @param {?number} defaultValue
     */
    constructor(
        description,
        defaultValue = null,
    ) {
        super();
        this.setLabel("Strike Count")
            .setDescription(description)
            .setTextInputComponent(new TextInputBuilder()
                .setCustomId('strike-count')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("1")
                .setMinLength(1)
                .setMaxLength(2)
                .setValue((defaultValue ?? 1).toString()));
    }
}
