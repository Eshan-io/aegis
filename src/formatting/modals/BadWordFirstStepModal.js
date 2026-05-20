import AutoResponseFirstStepModal from "./AutoResponseFirstStepModal.js";
import PunishmentSelect from "../components/PunishmentSelect.js";
import PriorityInput from "../components/PriorityInput.js";

export default class BadWordFirstStepModal extends AutoResponseFirstStepModal {
    /**
     * @param {import('../../commands/SubCommand.js').default} command
     * @param {?import('../../database/BadWord.js').default} existing
     */
    constructor(command, existing = null) {
        super(command, existing);
        this.addLabelComponent(new PunishmentSelect(existing))
            .addLabelComponent(new PriorityInput(existing));
    }
}
