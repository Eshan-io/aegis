import ParentCommand from '../ParentCommand.js';
import {PermissionFlagsBits, PermissionsBitField} from 'discord.js';
import SettingsOverviewCommand from './SettingsOverviewCommand.js';
import LogChannelCommand from './LogChannelCommand.js';
import MessageLogCommand from './MessageLogCommand.js';
import JoinLogCommand from './JoinLogCommand.js';
import SpamCommand from './SpamCommand.js';
import CapsCommand from './CapsCommand.js';
import HelpCenterCommand from './HelpCenterCommand.js';
import PlaylistCommand from './PlaylistCommand.js';
import SimilarMessagesCommand from './SimilarMessagesCommand.js';
import PunishmentsCommandGroup from './PunishmentsCommandGroup.js';
import ProtectedRolesCommandGroup from './ProtectedRolesCommandGroup.js';
import MutedRoleCommandGroup from './MutedRoleCommandGroup.js';
import LinkCoolDownCommand from './LinkCoolDownCommand.js';
import InvitesCommandGroup from './InvitesCommandGroup.js';
import AttachmentCoolDownCommand from './AttachmentCoolDownCommand.js';

export default class SettingsCommand extends ParentCommand {

    getDefaultMemberPermissions() {
        return new PermissionsBitField()
            .add(PermissionFlagsBits.ManageGuild);
    }

    getChildren() {
        return [
            new SettingsOverviewCommand(this),

            // Logging
            new LogChannelCommand(this),
            new MessageLogCommand(this),
            new JoinLogCommand(this),

            new PunishmentsCommandGroup(this),
            new ProtectedRolesCommandGroup(this),
            new MutedRoleCommandGroup(this),

            // Auto Moderation
            new SpamCommand(this),
            new CapsCommand(this),
            new SimilarMessagesCommand(this),
            new LinkCoolDownCommand(this),
            new AttachmentCoolDownCommand(this),
            new InvitesCommandGroup(this),

            // External
            new HelpCenterCommand(this),
            new PlaylistCommand(this),
        ];
    }

    getDescription() {
        return 'View and change guild settings.';
    }

    getName() {
        return 'settings';
    }
}
