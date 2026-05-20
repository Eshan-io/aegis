import {LabelBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

export default class CommentInput extends LabelBuilder {
    /**
     * @param {import("../../commands/ExecutableCommand.js").default} command
     */
    constructor(command) {
        super();
        this.setLabel('Comment')
            .setDescription('A comment for the ' + command.getName() + '. This is only visible to moderators.')
            .setTextInputComponent(new TextInputBuilder()
                .setRequired(false)
                .setCustomId('comment')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('No comment provided')
            );
    }
}
