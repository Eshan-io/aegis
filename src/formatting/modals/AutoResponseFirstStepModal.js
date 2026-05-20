import BetterModalBuilder from "../components/BetterModalBuilder.js";
import TriggerTypeSelect from "../components/TriggerTypeSelect.js";
import CTFCheckboxes from "../components/CTFCheckboxes.js";
import {toTitleCase} from "../../util/format.js";

export default class AutoResponseFirstStepModal extends BetterModalBuilder {
    /**
     * @param {import('../../commands/SubCommand.js').default} command
     * @param {?import('../../database/ChatTriggeredFeature.js.js').default} existing
     */
    constructor(command, existing = null) {
        super();

        let customId = command.getFullName();
        if (existing) {
            customId += ":" + existing.id;
        }

        this.setTitle(toTitleCase(command.getName() + " " + command.getTopLevelParent().getName()))
            .setCustomId(customId)
            .addLabelComponent(new TriggerTypeSelect(existing))
            .addLabelComponent(new CTFCheckboxes(command, existing));
    }
}
