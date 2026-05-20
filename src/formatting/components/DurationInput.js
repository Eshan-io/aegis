import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {formatTime} from "../../util/timeutils.js";
import {toTitleCase} from "../../util/format.js";

export default class DurationInput extends LabelBuilder {
    /**
     * @param {string} punishment
     * @param {?import('../../database/BadWord.js').default} existing
     */
    constructor(punishment, existing = null) {
        super();

        const input = new TextInputBuilder()
            .setRequired(false)
            .setCustomId('duration')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('infinite')
            .setMinLength(2)
            .setMaxLength(4000);

        if (existing?.punishment?.duration) {
            input.setValue(formatTime(existing.punishment.duration));
        }

        this.setLabel(toTitleCase(punishment + " Duration"))
            .setDescription("Duration of the " + punishment + ". Leave empty for infinite duration.")
            .setTextInputComponent(input);
    }
}
