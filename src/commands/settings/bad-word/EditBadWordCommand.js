import CompletingBadWordCommand from './CompletingBadWordCommand.js';
import Confirmation from '../../../database/Confirmation.js';
import {timeAfter} from '../../../util/timeutils.js';
import ErrorEmbed from '../../../formatting/embeds/ErrorEmbed.js';
import colors from '../../../util/colors.js';
import BadWord from '../../../database/BadWord.js';
import Punishment from '../../../database/Punishment.js';
import BadWordFirstStepModal from "../../../formatting/modals/BadWordFirstStepModal.js";
import NextStepMessage from "../../../formatting/messages/NextStepMessage.js";
import BadWordFirstStageModalData from "./BadWordFirstStageModalData.js";
import BadWordSecondStageModalData from "./BadWordSecondStageModalData.js";
import BadWordSecondStepModal from "../../../formatting/modals/BadWordSecondStepModal.js";

/**
 * @import {PunishmentAction} from '../../../database/Punishment.js';
 */

export default class EditBadWordCommand extends CompletingBadWordCommand {


    async execute(interaction) {
        const badWord = /** @type {?BadWord} */
            await BadWord.getByID(interaction.options.getInteger('id', true), interaction.guildId);

        if (!badWord) {
            await interaction.reply(ErrorEmbed.message('There is no bad-word with this id.'));
            return;
        }
        await this.showFirstStageModal(interaction, badWord);
    }

    async executeButton(interaction) {
        const parts = interaction.customId.split(':');
        const badWord = await this.getBadWord(interaction, parts);
        if (!badWord) {
            return;
        }

        if (parts.length === 3) {
            return this.showFirstStageModal(interaction, badWord);
        }

        const confirmation = await this.getConfirmation(interaction, parts);
        if (!confirmation) {
            return;
        }

        await interaction.showModal(new BadWordSecondStepModal(this, confirmation, badWord));
    }

    /**
     * @param {import('discord.js').Interaction} interaction
     * @param {BadWord} badWord
     * @returns {Promise<void>}
     */
    async showFirstStageModal(interaction, badWord) {
        await interaction.showModal(new BadWordFirstStepModal(this, badWord));
    }

    async executeModal(interaction) {
        let parts = interaction.customId.split(":");
        let badWord = await this.getBadWord(interaction, parts);
        if (!badWord) {
            return;
        }

        if (parts.length === 3) {
            return this.handleFirstStageModal(interaction, badWord);
        }

        const confirmation = await this.getConfirmation(interaction, parts);
        if (!confirmation) {
            return;
        }

        return this.handleSecondStageModal(interaction, badWord, confirmation);
    }

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @param {BadWord} badWord
     * @returns {Promise<unknown>}
     */
    async handleFirstStageModal(interaction, badWord) {
        const confirmation = new Confirmation(BadWordFirstStageModalData.fromInteraction(interaction), timeAfter("1 hour"));
        const id = 'badword:edit:' + badWord.id + ':' + await confirmation.save();
        await interaction.reply(new NextStepMessage(1, 2, id));
    }

    /**
     * Get a confirmation from the interactions custom id
     * @param {import('discord.js').ModalSubmitInteraction|import('discord.js').ButtonInteraction} interaction
     * @param {string[]} parts
     * @returns {Promise<?Confirmation<BadWordFirstStageModalData>>}
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
     * @returns {Promise<?BadWord>}
     */
    async getBadWord(interaction, parts) {
        const id = parts[2];
        const badWord = await BadWord.getByID(id, interaction.guildId);

        if (!badWord) {
            await interaction.reply(ErrorEmbed.message('Could not find this bad word.'));
            return null;
        }
        return badWord;
    }

    /**
     * @param {import('discord.js').ModalSubmitInteraction} interaction
     * @param {BadWord} badWord
     * @param {Confirmation<BadWordFirstStageModalData>} confirmation
     * @returns {Promise<unknown>}
     */
    async handleSecondStageModal(interaction, badWord, confirmation) {
        await confirmation.delete();
        const data = BadWordSecondStageModalData.fromInteraction(interaction);
        if (!data.trigger || (!confirmation.data.global && !data.channels.length)) {
            return await interaction.reply(ErrorEmbed.message("Failed to parse modal data!"));
        }

        badWord.global = confirmation.data.global;
        badWord.channels = data.channels;
        badWord.enableVision = confirmation.data.imageDetection;
        const triggerResponse = BadWord.getTrigger(confirmation.data.triggerType, data.trigger);
        if (!triggerResponse.success) {
            return interaction.reply(ErrorEmbed.message(triggerResponse.message));
        }
        badWord.trigger = triggerResponse.trigger;
        badWord.response = data.response || 'disabled';
        badWord.dm = data.directMessage || 'disabled';
        badWord.punishment = new Punishment({action: confirmation.data.punishment, duration: data.duration, count: data.strikeCount});
        badWord.priority = confirmation.data.priority;
        await badWord.save();

        await interaction.reply(badWord
            .embed('Edited Bad-word', colors.GREEN)
            .toMessage()
        );
    }

    getDescription() {
        return 'Modify an bad-word';
    }

    getName() {
        return 'edit';
    }
}
