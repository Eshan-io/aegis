import ParentCommand from '../ParentCommand.js';
import DelegatingSubCommand from '../DelegatingSubCommand.js';
import UserInfoCommand from '../user/UserInfoCommand.js';
import AvatarCommand from '../user/AvatarCommand.js';
import RankCommand from '../user/RankCommand.js';
import BanCommand from '../user/BanCommand.js';
import UnbanCommand from '../user/UnbanCommand.js';
import SoftBanCommand from '../user/SoftBanCommand.js';
import KickCommand from '../user/KickCommand.js';
import MuteCommand from '../user/MuteCommand.js';
import UnmuteCommand from '../user/UnmuteCommand.js';
import StrikeCommand from '../user/StrikeCommand.js';
import PardonCommand from '../user/PardonCommand.js';
import StrikePurgeCommand from '../user/StrikePurgeCommand.js';

export default class MemberCommand extends ParentCommand {
    getChildren() {
        return [
            new DelegatingSubCommand(this, new UserInfoCommand(), {
                name: 'info',
                description: 'Show information about a user',
            }),
            new DelegatingSubCommand(this, new AvatarCommand()),
            new DelegatingSubCommand(this, new RankCommand()),
            new DelegatingSubCommand(this, new BanCommand()),
            new DelegatingSubCommand(this, new UnbanCommand()),
            new DelegatingSubCommand(this, new SoftBanCommand()),
            new DelegatingSubCommand(this, new KickCommand()),
            new DelegatingSubCommand(this, new MuteCommand()),
            new DelegatingSubCommand(this, new UnmuteCommand()),
            new DelegatingSubCommand(this, new StrikeCommand()),
            new DelegatingSubCommand(this, new PardonCommand()),
            new DelegatingSubCommand(this, new StrikePurgeCommand()),
        ];
    }

    getDescription() {
        return 'User info, levels, and moderation actions';
    }

    getName() {
        return 'member';
    }
}
