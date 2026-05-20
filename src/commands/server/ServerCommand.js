import ParentCommand from '../ParentCommand.js';
import DelegatingSubCommand from '../DelegatingSubCommand.js';
import GuildInfoCommand from '../guild/GuildInfoCommand.js';
import RoleInfoCommand from '../guild/RoleInfoCommand.js';
import IDCommand from '../guild/IDCommand.js';
import LockCommand from '../guild/LockCommand.js';
import UnlockCommand from '../guild/UnlockCommand.js';
import PurgeCommand from '../guild/PurgeCommand.js';
import PurgeInvitesCommand from '../guild/PurgeInvitesCommand.js';
import LeaderboardCommand from '../guild/LeaderboardCommand.js';

export default class ServerCommand extends ParentCommand {
    getChildren() {
        return [
            new DelegatingSubCommand(this, new GuildInfoCommand(), {
                name: 'info',
                description: 'Show information about this server',
            }),
            new DelegatingSubCommand(this, new RoleInfoCommand()),
            new DelegatingSubCommand(this, new IDCommand()),
            new DelegatingSubCommand(this, new LockCommand()),
            new DelegatingSubCommand(this, new UnlockCommand()),
            new DelegatingSubCommand(this, new PurgeCommand()),
            new DelegatingSubCommand(this, new PurgeInvitesCommand()),
            new DelegatingSubCommand(this, new LeaderboardCommand()),
        ];
    }

    getDescription() {
        return 'Server utilities, cleanup, and info';
    }

    getName() {
        return 'server';
    }
}
