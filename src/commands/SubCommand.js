import ExecutableCommand from './ExecutableCommand.js';
import SubCommandGroup from "./SubCommandGroup.js";

/**
 * @typedef {import('./Command.js').default|import('./SubCommandGroup.js').default} ParentCommand
 */

/**
 * @abstract
 */
export default class SubCommand extends ExecutableCommand {
    /**
     * @type {ParentCommand}
     */
    parent;

    /**
     * @param {ParentCommand} parent
     */
    constructor(parent) {
        super();
        this.parent = parent;
    }

    /**
     * add options to slash command builder
     * @param {import('discord.js').SlashCommandSubcommandBuilder} builder
     * @returns {import('discord.js').SlashCommandSubcommandBuilder}
     */
    buildOptions(builder) {
        return super.buildOptions(builder);
    }

    /**
     * @param {import('discord.js').SlashCommandSubcommandBuilder} builder
     * @returns {import('discord.js').SlashCommandSubcommandBuilder}
     */
    buildSubCommand(builder) {
        builder.setName(this.getName());
        builder.setDescription(this.getDescription());
        this.buildOptions(builder);

        return builder;
    }

    getFullName(separator = ":") {
        let prefix = "";
        if (this.parent instanceof SubCommandGroup) {
            prefix = this.parent.parent.getName() + separator;
        }

        return prefix + this.parent.getName() + separator + this.getName();
    }

    getTopLevelParent() {
        let parent = this.parent;
        if (parent instanceof SubCommandGroup) {
            parent = parent.parent;
        }
        return parent;
    }
}
