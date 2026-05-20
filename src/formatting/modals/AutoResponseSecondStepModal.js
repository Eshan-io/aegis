import BetterModalBuilder from "../components/BetterModalBuilder.js";
import TriggerInput from "../components/TriggerInput.js";
import ResponseInput from "../components/ResponseInput.js";
import ChannelsSelect from "../components/ChannelsSelect.js";
import {toTitleCase} from "../../util/format.js";

export default class AutoResponseSecondStepModal extends BetterModalBuilder {
    /**
     * @param {import('../../commands/SubCommand.js').default} command
     * @param {import('../../database/Confirmation.js').default<{global: boolean, triggerType: string}>} confirmation
     * @param {import('../../database/AutoResponse.js').default|import('../../database/BadWord.js').default|null} existing
     */
    constructor(command, confirmation, existing = null) {
        let customId = command.getFullName();
        if (existing) {
            customId += ":" + existing.id;
        }
        customId += ":" + confirmation.id;

        super();
        this.setTitle(toTitleCase(command.getName() + " " + command.getTopLevelParent().getName()))
            .setCustomId(customId)
            .addLabelComponent(new TriggerInput(confirmation.data.triggerType, existing))
            .addLabelComponent(new ResponseInput(this.requiresResponse(), existing));

        if (!confirmation.data.global) {
            this.addLabelComponent(new ChannelsSelect(command, existing));
        }
    }

    /**
     * @protected
     * @returns {boolean}
     */
    requiresResponse() {
        return true;
    }
}
