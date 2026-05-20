export default class AutoResponseSecondStageModalData {
    /**
     * @type {string}
     */
    trigger;

    /**
     * @type {string}
     */
    response;

    /**
     * @type {import('discord.js').Snowflake[]}
     */
    channels = [];

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @returns {AutoResponseSecondStageModalData}
     */
    static fromInteraction(interaction) {
        const data = new AutoResponseSecondStageModalData();
        for (let label of interaction.components) {
            switch (label.component.customId) {
                case 'trigger':
                    data.trigger = (/** @type {import('discord.js').TextInputModalData} */ label.component).value;
                    break;
                case 'response':
                    data.response = (/** @type {import('discord.js').TextInputModalData} */ label.component).value;
                    break;
                case 'channels':
                    data.channels = (/** @type {import('discord.js').SelectMenuModalData} */ label.component).values;
                    break;
            }
        }

        return data;
    }
}
