import SubCommand from '../../SubCommand.js';
import Confirmation from '../../../database/Confirmation.js';
import AutoResponse from '../../../database/AutoResponse.js';
import ErrorEmbed from '../../../formatting/embeds/ErrorEmbed.js';
import colors from '../../../util/colors.js';
import NextStepMessage from "../../../formatting/messages/NextStepMessage.js";
import {timeAfter} from "../../../util/timeutils.js";
import AutoResponseSecondStepModal from "../../../formatting/modals/AutoResponseSecondStepModal.js";
import AutoResponseFirstStepModal from "../../../formatting/modals/AutoResponseFirstStepModal.js";
import AutoResponseFistStageModalData from "./AutoResponseFistStageModalData.js";
import AutoResponseSecondStageModalData from "./AutoResponseSecondStageModalData.js";

export default class AddAutoResponseCommand extends SubCommand {
    async execute(interaction) {
        await interaction.showModal(new AutoResponseFirstStepModal(this));
    }

    async executeButton(interaction) {
        const confirmation = await this.getConfirmation(interaction);
        if (!confirmation) {
            return;
        }

        return await interaction.showModal(new AutoResponseSecondStepModal(this, confirmation));
    }

    async executeModal(interaction) {
        if (interaction.customId === this.getFullName()) {
            return this.handleFirstStageModal(interaction);
        }

        const confirmation = await this.getConfirmation(interaction);
        if (!confirmation) {
            return;
        }

        return this.handleSecondStageModal(interaction, confirmation);
    }

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @returns {Promise<unknown>}
     */
    async handleFirstStageModal(interaction) {
        const confirmation = new Confirmation(AutoResponseFistStageModalData.fromInteraction(interaction), timeAfter("1 hour"));
        const id = 'response:add:' + await confirmation.save();
        await interaction.reply(new NextStepMessage(1, 2, id));
    }

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @param {Confirmation<AutoResponseFistStageModalData>} confirmation
     * @returns {Promise<unknown>}
     */
    async handleSecondStageModal(interaction, confirmation) {
        await confirmation.delete();
        const data = AutoResponseSecondStageModalData.fromInteraction(interaction);
        if (!data.trigger || !data.response || (!confirmation.data.global && !data.channels.length)) {
            return await interaction.reply(ErrorEmbed.message("Failed to parse modal data!"));
        }

        const result = await AutoResponse.new(
            interaction.guild.id,
            confirmation.data.global,
            data.channels,
            confirmation.data.triggerType,
            data.trigger,
            data.response,
            confirmation.data.imageDetection,
        );
        if (!result.success) {
            await interaction.reply(ErrorEmbed.message(result.message));
            return;
        }

        await interaction.reply(result.response
            .embed('Added new auto-response', colors.GREEN)
            .toMessage()
        );
    }

    /**
     * Get a confirmation from the interactions custom id
     * @param {import('discord.js').ModalSubmitInteraction|import('discord.js').ButtonInteraction} interaction
     * @returns {Promise<?Confirmation<AutoResponseFistStageModalData>>}
     */
    async getConfirmation(interaction) {
        const confirmationId = interaction.customId.split(':')[2];
        const confirmation = await Confirmation.get(confirmationId);

        if (!confirmation) {
            await interaction.reply(ErrorEmbed.message('This confirmation has expired.'));
            return null;
        }
        return confirmation;
    }

    getDescription() {
        return 'Add a new auto-response';
    }

    getName() {
        return 'add';
    }
}
