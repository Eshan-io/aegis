import {PermissionFlagsBits, PermissionsBitField} from 'discord.js';
import ParentCommand from '../ParentCommand.js';
import DelegatingSubCommand from '../DelegatingSubCommand.js';
import ShowLevelingCommand from './leveling/ShowLevelingCommand.js';
import SetLevelingCommand from './leveling/SetLevelingCommand.js';
import SetLevelingChannelCommand from './leveling/SetLevelingChannelCommand.js';
import SetLevelingUserCommand from './leveling/SetLevelingUserCommand.js';

export default class LevelCommand extends ParentCommand {
    getDefaultMemberPermissions() {
        return new PermissionsBitField()
            .add(PermissionFlagsBits.ManageGuild);
    }

    getChildren() {
        return [
            new DelegatingSubCommand(this, new ShowLevelingCommand(this), {
                name: 'view',
                description: 'Show the current leveling settings',
            }),
            new DelegatingSubCommand(this, new SetLevelingCommand(this)),
            new DelegatingSubCommand(this, new SetLevelingChannelCommand(this)),
            new DelegatingSubCommand(this, new SetLevelingUserCommand(this)),
        ];
    }

    getDescription() {
        return 'View and change leveling settings';
    }

    getName() {
        return 'level';
    }
}
