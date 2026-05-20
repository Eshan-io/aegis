import CTFCheckboxes from "../../../formatting/components/CTFCheckboxes.js";

export default class AutoResponseFistStageModalData {
    /**
     * @type {string}
     */
    triggerType = "include";

    /**
     * @type {boolean}
     */
    global = false;

    /**
     * @type {boolean}
     */
    imageDetection = false;

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @returns {AutoResponseFistStageModalData}
     */
    static fromInteraction(interaction) {
        const data = new this();
        data.imageDetection = false;
        for (let label of interaction.components) {
            switch (label.component.customId) {
                case 'trigger-type':
                    data.triggerType = (/** @type {import('discord.js').SelectMenuModalData} */ label.component).values[0];
                    break;
                case CTFCheckboxes.GLOBAL_ID:
                    data.global = (/** @type {import('discord.js').CheckboxModalData} */ label.component).value;
                    break;
                case CTFCheckboxes.OPTIONS_ID: {
                    const group = /** @type {import('discord.js').CheckboxGroupModalData} */ label.component;
                    data.global = group.values.includes(CTFCheckboxes.GLOBAL_ID);
                    data.imageDetection = group.values.includes(CTFCheckboxes.IMAGE_DETECTION_ID);
                    break;
                }
            }
        }

        return data;
    }
}
