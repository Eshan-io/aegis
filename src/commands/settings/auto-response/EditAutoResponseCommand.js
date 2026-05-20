import CompletingAutoResponseCommand from './CompletingAutoResponseCommand.js';
import Confirmation from '../../../database/Confirmation.js';
import {timeAfter} from '../../../util/timeutils.js';
import AutoResponse from '../../../database/AutoResponse.js';
import ErrorEmbed from '../../../formatting/embeds/ErrorEmbed.js';
import colors from '../../../util/colors.js';
import AutoResponseFirstStepModal from "../../../formatting/modals/AutoResponseFirstStepModal.js";
import NextStepMessage from "../../../formatting/messages/NextStepMessage.js";
import AutoResponseFistStageModalData from "./AutoResponseFistStageModalData.js";
import AutoResponseSecondStageModalData from "./AutoResponseSecondStageModalData.js";
import AutoResponseSecondStepModal from "../../../formatting/modals/AutoResponseSecondStepModal.js";

export default class EditAutoResponseCommand extends CompletingAutoResponseCommand {
    async execute(interaction) {
        const autoResponse = /** @type {?AutoResponse} */
            await AutoResponse.getByID(interaction.options.getInteger('id', true), interaction.guildId);

        if (!autoResponse) {
            await interaction.reply(ErrorEmbed.message('There is no auto-response with this id.'));
            return;
        }
        await this.showFirstStageModal(interaction, autoResponse);
    }

    async executeButton(interaction) {
        const parts = interaction.customId.split(':');
        const response = await this.getAutoResponse(interaction, parts);
        if (!response) {
            return;
        }

        if (parts.length === 3) {
            return this.showFirstStageModal(interaction, response);
        }

        const confirmation = await this.getConfirmation(interaction, parts);
        if (!confirmation) {
            return;
        }

        await interaction.showModal(new AutoResponseSecondStepModal(this, confirmation, response));
    }

    /**
     * @param {import('discord.js').Interaction} interaction
     * @param {AutoResponse} autoResponse
     * @returns {Promise<void>}
     */
    async showFirstStageModal(interaction, autoResponse) {
        await interaction.showModal(new AutoResponseFirstStepModal(this, autoResponse));
    }

    async executeModal(interaction) {
        let parts = interaction.customId.split(":");
        let response = await this.getAutoResponse(interaction, parts);
        if (!response) {
            return;
        }

        if (parts.length === 3) {
            return this.handleFirstStageModal(interaction, response);
        }

        const confirmation = await this.getConfirmation(interaction, parts);
        if (!confirmation) {
            return;
        }

        return this.handleSecondStageModal(interaction, response, confirmation);
    }

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @param {AutoResponse} response
     * @returns {Promise<unknown>}
     */
    async handleFirstStageModal(interaction, response) {
        const confirmation = new Confirmation(AutoResponseFistStageModalData.fromInteraction(interaction), timeAfter("1 hour"));
        const id = 'response:edit:' + response.id + ':' + await confirmation.save();
        await interaction.reply(new NextStepMessage(1, 2, id));
    }

    /**
     * Get a confirmation from the interactions custom id
     * @param {import('discord.js').ModalSubmitInteraction|import('discord.js').ButtonInteraction} interaction
     * @param {string[]} parts
     * @returns {Promise<?Confirmation<AutoResponseFistStageModalData>>}
     */
    async getConfirmation(interaction, parts) {
        const confirmationId = parts[3];
        const confirmation = await Confirmation.get(confirmationId);

        if (!confirmation) {
            await interaction.reply(ErrorEmbed.message('This confirmation has expired.'));
            return null;
        }
        return confirmation;
    }

    /**
     * @param {import('discord.js').ModalSubmitInteraction|import('discord.js').ButtonInteraction} interaction
     * @param {string[]} parts
     * @returns {Promise<?AutoResponse>}
     */
    async getAutoResponse(interaction, parts) {
        const id = parts[2];
        const response = await AutoResponse.getByID(id, interaction.guildId);

        if (!response) {
            await interaction.reply(ErrorEmbed.message('Could not find this response.'));
            return null;
        }
        return response;
    }

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @param {AutoResponse} autoResponse
     * @param {Confirmation<AutoResponseFistStageModalData>} confirmation
     * @returns {Promise<unknown>}
     */
    async handleSecondStageModal(interaction, autoResponse, confirmation) {
        await confirmation.delete();
        const data = AutoResponseSecondStageModalData.fromInteraction(interaction);
        if (!data.trigger || !data.response || (!confirmation.data.global && !data.channels.length)) {
            return await interaction.reply(ErrorEmbed.message("Failed to parse modal data!"));
        }

        autoResponse.global = confirmation.data.global;
        autoResponse.channels = data.channels;
        autoResponse.enableVision = confirmation.data.imageDetection;
        const triggerResponse = AutoResponse.getTrigger(confirmation.data.triggerType, data.trigger);
        if (!triggerResponse.success) {
            return interaction.reply(ErrorEmbed.message(triggerResponse.message));
        }
        autoResponse.trigger = triggerResponse.trigger;
        autoResponse.response = data.response;
        await autoResponse.save();

        await interaction.reply(autoResponse
            .embed('Edited auto-response', colors.GREEN)
            .toMessage()
        );
    }

    getDescription() {
        return 'Modify an auto-response';
    }

    getName() {
        return 'edit';
    }
}
