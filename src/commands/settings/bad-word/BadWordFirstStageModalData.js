import AutoResponseFistStageModalData from "../auto-response/AutoResponseFistStageModalData.js";

export default class BadWordFirstStageModalData extends AutoResponseFistStageModalData {
    /**
     * @type {import('../../../database/Punishment.js').PunishmentAction}
     */
    punishment = 'none';
    priority = '0';

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @returns {BadWordFirstStageModalData}
     */
    static fromInteraction(interaction) {
        const data = /** @type {BadWordFirstStageModalData} */ super.fromInteraction(interaction);

        for (let label of interaction.components) {
            switch (label.component.customId) {
                case 'punishment':
                    data.punishment = (/** @type {import('discord.js').SelectMenuModalData} */ label.component).values[0];
                    break;
                case 'priority': {
                    data.priority = (/** @type {import('discord.js').TextInputModalData} */ label.component).value;
                    break;
                }
            }
        }

        return data;
    }
}
