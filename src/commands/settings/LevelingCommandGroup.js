import SubCommandGroup from '../SubCommandGroup.js';
import ShowLevelingCommand from './leveling/ShowLevelingCommand.js';
import SetLevelingCommand from './leveling/SetLevelingCommand.js';
import SetLevelingChannelCommand from './leveling/SetLevelingChannelCommand.js';
import SetLevelingUserCommand from './leveling/SetLevelingUserCommand.js';

export default class LevelingCommandGroup extends SubCommandGroup {
    getChildren() {
        return [
            new ShowLevelingCommand(this),
            new SetLevelingCommand(this),
            new SetLevelingChannelCommand(this),
            new SetLevelingUserCommand(this),
        ];
    }

    getDescription() {
        return 'Configure the leveling module';
    }

    getName() {
        return 'leveling';
    }
}
