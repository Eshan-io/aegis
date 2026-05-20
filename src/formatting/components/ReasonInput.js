import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class ReasonInput extends LabelBuilder {
    /**
     * @param {import("../../commands/ExecutableCommand.js").default} command
     */
    constructor(command) {
        super();
        this.setLabel('Reason')
            .setDescription('The reason for the ' + command.getName() + ". This is visible to the affected user.")
            .setTextInputComponent(new TextInputBuilder()
                .setRequired(false)
                .setCustomId('reason')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('No reason provided')
            );
    }
}
