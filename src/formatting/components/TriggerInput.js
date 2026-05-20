import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import AutoResponse from "../../database/AutoResponse.js";

export default class TriggerInput extends LabelBuilder {
    /**
     * @param {string} type
     * @param {?import('../../database/ChatTriggeredFeature.js').default} existing
     */
    constructor(type, existing = null) {
        super();

        const input = new TextInputBuilder()
            .setRequired(true)
            .setCustomId('trigger')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(AutoResponse.getTriggerPlaceholder(type))
            .setMinLength(1)
            .setMaxLength(4000);

        if (existing?.trigger) {
            input.setValue(existing.trigger.asContentString());
        }

        this.setLabel('Trigger')
            .setDescription('Get value of the trigger')
            .setTextInputComponent(input);
    }
}
