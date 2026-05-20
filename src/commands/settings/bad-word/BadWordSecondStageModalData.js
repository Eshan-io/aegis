import AutoResponseSecondStageModalData from "../auto-response/AutoResponseSecondStageModalData.js";
import {parseTime} from "../../../util/timeutils.js";

export default class BadWordSecondStageModalData extends AutoResponseSecondStageModalData {
    /**
     * @type {?number}
     */
    duration = null;
    /**
     * @type {?number}
     */
    strikeCount = null;
    directMessage = null;

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @returns {BadWordSecondStageModalData}
     */
    static fromInteraction(interaction) {
        const data = /** @type {BadWordSecondStageModalData} */ super.fromInteraction(interaction);

        for (let label of interaction.components) {
            switch (label.component.customId) {
                case 'dm':
                    data.directMessage = (/** @type {import('discord.js').TextInputModalData} */ label.component).value;
                    break;
                case 'duration':
                    data.duration = parseTime((/** @type {import('discord.js').TextInputModalData} */ label.component).value);
                    break;
                case 'strike-count':
                    data.strikeCount = parseInt((/** @type {import('discord.js').TextInputModalData} */ label.component).value);
                    break;
            }
        }

        return data;
    }

}
