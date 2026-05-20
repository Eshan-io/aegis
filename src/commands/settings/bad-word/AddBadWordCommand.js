import Confirmation from '../../../database/Confirmation.js';
import {timeAfter} from '../../../util/timeutils.js';
import ErrorEmbed from '../../../formatting/embeds/ErrorEmbed.js';
import colors from '../../../util/colors.js';
import BadWord from '../../../database/BadWord.js';
import SubCommand from "../../SubCommand.js";
import NextStepMessage from "../../../formatting/messages/NextStepMessage.js";
import BadWordFirstStepModal from "../../../formatting/modals/BadWordFirstStepModal.js";
import BadWordSecondStepModal from "../../../formatting/modals/BadWordSecondStepModal.js";
import BadWordFirstStageModalData from "./BadWordFirstStageModalData.js";
import BadWordSecondStageModalData from "./BadWordSecondStageModalData.js";

/**
 * @typedef {object} BadWordConfirmationData
 * @property {string} triggerType
 * @property {boolean} global
 * @property {boolean} imageDetection
 * @property {string} punishment
 * @property {number} priority
 */

export default class AddBadWordCommand extends SubCommand {
    async execute(interaction) {
        await interaction.showModal(new BadWordFirstStepModal(this));
    }

    async executeButton(interaction) {
        const confirmation = await this.getConfirmation(interaction);
        if (!confirmation) {
            return;
        }

        return await interaction.showModal(new BadWordSecondStepModal(this, confirmation));
    }

    async executeModal(interaction) {
        if (interaction.customId === 'badword:add') {
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
        const confirmationData = BadWordFirstStageModalData.fromInteraction(interaction);
        const confirmation = new Confirmation(confirmationData, timeAfter("1 hour"));
        const id = 'badword:add:' + await confirmation.save();
        await interaction.reply(new NextStepMessage(1, 2, id));
    }

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @param {Confirmation<BadWordConfirmationData>} confirmation
     * @returns {Promise<unknown>}
     */
    async handleSecondStageModal(interaction, confirmation) {
        await confirmation.delete();

        const data = BadWordSecondStageModalData.fromInteraction(interaction);

        if (!data.trigger || (!confirmation.data.global && !data.channels.length)) {
            return await interaction.reply(ErrorEmbed.message("Failed to parse modal data!"));
        }

        const result = await BadWord.new(
            interaction.guild.id,
            confirmation.data.global,
            data.channels,
            confirmation.data.triggerType,
            data.trigger,
            data.response,
            confirmation.data.punishment,
            data.duration,
            confirmation.data.priority,
            data.directMessage,
            confirmation.data.imageDetection,
            data.strikeCount,
        );
        if (!result.success) {
            await interaction.reply(ErrorEmbed.message(result.message));
            return;
        }

        await interaction.reply(result.badWord
            .embed('Added new bad-word', colors.GREEN)
            .toMessage()
        );
    }

    /**
     * Get a confirmation from the interactions custom id
     * @param {import('discord.js').ModalSubmitInteraction|import('discord.js').ButtonInteraction} interaction
     * @returns {Promise<?Confirmation<BadWordConfirmationData>>}
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
        return 'Add a new bad-word';
    }

    getName() {
        return 'add';
    }
}
