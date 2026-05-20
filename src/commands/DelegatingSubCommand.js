import SubCommand from './SubCommand.js';

export default class DelegatingSubCommand extends SubCommand {
    /**
     * @param {import('./Command.js').default|import('./SubCommandGroup.js').default} parent
     * @param {import('./ExecutableCommand.js').default} command
     * @param {{name?: string, description?: string}} [options]
     */
    constructor(parent, command, options = {}) {
        super(parent);
        this.command = command;
        this.options = options;
    }

    getName() {
        return this.options.name ?? this.command.getName();
    }

    getDescription() {
        return this.options.description ?? this.command.getDescription();
    }

    getCoolDown() {
        return this.command.getCoolDown();
    }

    isAvailableInDMs() {
        return this.command.isAvailableInDMs();
    }

    getRequiredBotPermissions() {
        return this.command.getRequiredBotPermissions();
    }

    getDefaultMemberPermissions() {
        return this.command.getDefaultMemberPermissions?.() ?? null;
    }

    buildOptions(builder) {
        return this.command.buildOptions(builder);
    }

    async complete(interaction) {
        return this.command.complete(interaction);
    }

    async execute(interaction) {
        return this.command.execute(interaction);
    }
}
