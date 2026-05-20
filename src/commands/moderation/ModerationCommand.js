import ModerationShowCommand from './ModerationShowCommand.js';
import ParentCommand from '../ParentCommand.js';
import ModerationClearCommand from './ModerationClearCommand.js';
import ModerationDeleteCommand from './ModerationDeleteCommand.js';
import ModerationListCommand from './ModerationListCommand.js';
import {PermissionFlagsBits, PermissionsBitField} from 'discord.js';
import ModerationEditCommand from './ModerationEditCommand.js';

export default class ModerationCommand extends ParentCommand {

    getDefaultMemberPermissions() {
        return new PermissionsBitField()
            .add(PermissionFlagsBits.ModerateMembers);
    }

    getChildren() {
        return [
            new ModerationShowCommand(this),
            new ModerationEditCommand(this),
            new ModerationDeleteCommand(this),
            new ModerationListCommand(this),
            new ModerationClearCommand(this),
        ];
    }

    getDescription() {
        return 'View and manage moderations';
    }

    getName() {
        return 'case';
    }
}
