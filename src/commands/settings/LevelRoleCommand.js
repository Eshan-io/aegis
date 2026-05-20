import {PermissionFlagsBits, PermissionsBitField} from 'discord.js';
import ParentCommand from '../ParentCommand.js';
import DelegatingSubCommand from '../DelegatingSubCommand.js';
import AddLevelingRoleCommand from './leveling/AddLevelingRoleCommand.js';
import RemoveLevelingRoleCommand from './leveling/RemoveLevelingRoleCommand.js';
import ListLevelingRolesCommand from './leveling/ListLevelingRolesCommand.js';

export default class LevelRoleCommand extends ParentCommand {
    getDefaultMemberPermissions() {
        return new PermissionsBitField()
            .add(PermissionFlagsBits.ManageGuild);
    }

    getChildren() {
        return [
            new DelegatingSubCommand(this, new AddLevelingRoleCommand(this), {
                name: 'set',
                description: 'Add or replace a leveling reward role',
            }),
            new DelegatingSubCommand(this, new RemoveLevelingRoleCommand(this), {
                name: 'remove',
                description: 'Remove a leveling reward role',
            }),
            new DelegatingSubCommand(this, new ListLevelingRolesCommand(this), {
                name: 'list',
                description: 'List leveling reward roles',
            }),
        ];
    }

    getDescription() {
        return 'Manage leveling reward roles';
    }

    getName() {
        return 'levelrole';
    }
}
