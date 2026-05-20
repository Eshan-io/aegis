import AutoResponseSecondStepModal from "./AutoResponseSecondStepModal.js";
import DirectMessageInput from "../components/DirectMessageInput.js";
import DurationInput from "../components/DurationInput.js";
import StrikeCountInput from "../components/StrikeCountInput.js";

export default class BadWordSecondStepModal extends AutoResponseSecondStepModal {
    /**
     * @param {import('../../commands/SubCommand.js').default} command
     * @param {import('../../database/Confirmation.js').default<{global: boolean, triggerType: string, punishment: string}>} confirmation
     * @param {?import('../../database/BadWord.js').default} existing
     */
    constructor(command, confirmation, existing = null) {
        super(command, confirmation, existing);
        this.addLabelComponent(new DirectMessageInput(existing));


        if (['ban', 'mute'].includes(confirmation.data.punishment)) {
            this.addLabelComponent(new DurationInput(confirmation.data.punishment, existing));
        } else if (confirmation.data.punishment === 'strike') {
            this.addLabelComponent(new StrikeCountInput("Number of strikes the user should receive when triggering this bad word.", existing?.punishment?.count));
        }
    }

    requiresResponse() {
        return false;
    }
}
