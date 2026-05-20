import StrikeCommand from './StrikeCommand.js';
import {PermissionFlagsBits} from 'discord.js';
import MemberWrapper from '../../discord/MemberWrapper.js';
import Confirmation from '../../database/Confirmation.js';
import {MODAL_TITLE_LIMIT} from '../../util/apiLimits.js';
import ChannelWrapper from '../../discord/ChannelWrapper.js';
import GuildWrapper from '../../discord/GuildWrapper.js';
import PurgeLogEmbed from '../../formatting/embeds/PurgeLogEmbed.js';
import {deferReplyOnce} from '../../util/interaction.js';
import ReasonInput from "../../formatting/components/ReasonInput.js";
import CommentInput from "../../formatting/components/CommentInput.js";
import BetterModalBuilder from "../../formatting/components/BetterModalBuilder.js";
import StrikeCountInput from "../../formatting/components/StrikeCountInput.js";
import MessageDeletionLimitInput from "../../formatting/components/MessageDeletionLimitInput.js";

/**
 * @import {StrikeConfirmationData} from './StrikeCommand.js';
 */

/**
 * @typedef {StrikeConfirmationData} StrikePurgeConfirmationData
 * @property {number} limit
 */

export default class StrikePurgeCommand extends StrikeCommand {
    buildOptions(builder) {
        super.buildOptions(builder);
        builder.addIntegerOption(option => option
            .setName('limit')
            .setDescription('Delete messages sent by this user in the last x messages (default: 100)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(1000));
        return builder;
    }

    getDefaultMemberPermissions() {
        return super.getDefaultMemberPermissions()
            .add(PermissionFlagsBits.ManageMessages);
    }

    getRequiredBotPermissions() {
        return super.getDefaultMemberPermissions()
            .add(PermissionFlagsBits.ManageMessages);
    }

    supportsUserCommands() {
        return false;
    }

    async execute(interaction) {
        await this.strikePurge(interaction,
            new MemberWrapper(interaction.options.getUser('user', true), interaction.guild),
            interaction.options.getString('reason'),
            interaction.options.getString('comment'),
            interaction.options.getInteger('count'),
            interaction.options.getInteger('limit'),
        );
    }

    /**
     *
     * @param {import('discord.js').Interaction} interaction
     * @param {?MemberWrapper} member
     * @param {?string} reason
     * @param {?string} comment
     * @param {?number} count
     * @param {?number} limit
     * @returns {Promise<void>}
     */
    async strikePurge(interaction, member, reason, comment, count, limit) {
        await deferReplyOnce(interaction);
        reason = reason || 'No reason provided';

        if (!count || count < 1) {
            count = 1;
        }

        limit ??= 100;
        if (limit > 1000) {
            limit = 1000;
        }

        if (!await this.checkPermissions(interaction, member) ||
            !await this.preventDuplicateModeration(interaction, member, {reason, comment, count, limit})) {
            return;
        }
        await super.strike(interaction, member, reason, comment, count);


        const channel = new ChannelWrapper(/** @type {import('discord.js').GuildChannel}*/ interaction.channel);
        const messages = (await channel.getMessages(limit))
            .filter(message => message.author.id === member.user.id);

        if (messages.size) {
            await channel.bulkDelete(Array.from(messages.keys()));
        }

        await (new GuildWrapper(interaction.guild))
            .log(new PurgeLogEmbed(
                interaction,
                messages.size,
                limit,
                member.user
            ).toMessage());
    }

    async executeButton(interaction) {
        const parts = interaction.customId.split(':');
        if (parts[1] === 'confirm') {
            /** @type {Confirmation<StrikePurgeConfirmationData>}*/
            const data = await Confirmation.get(parts[2]);
            if (!data) {
                await interaction.update({content: 'This confirmation has expired.', embeds: [], components: []});
                return;
            }

            await this.strikePurge(
                interaction,
                await MemberWrapper.getMember(interaction, data.data.user),
                data.data.reason,
                data.data.comment,
                data.data.count,
                data.data.limit,
            );
            return;
        }

        await this.promptForData(interaction, await MemberWrapper.getMemberFromCustomId(interaction));
    }

    /**
     * prompt user for strike reason, count and message test limit
     * @param {import('discord.js').Interaction} interaction
     * @param {?MemberWrapper} member
     * @returns {Promise<void>}
     */
    async promptForData(interaction, member) {
        if (!member) {
            return;
        }

        await interaction.showModal(new BetterModalBuilder()
            .setTitle(`Strike-purge ${await member.displayName()}`.substring(0, MODAL_TITLE_LIMIT))
            .setCustomId(`strike-purge:${member.user.id}`)
            .addLabelComponent(new ReasonInput(this))
            .addLabelComponent(new CommentInput(this))
            .addLabelComponent(new StrikeCountInput("The number of strikes you want to give to this user"))
            .addLabelComponent(new MessageDeletionLimitInput())
        );
    }

    async executeModal(interaction) {
        let reason, comment, count, limit;
        for (let label of interaction.components) {
            switch (label.component.customId) {
                case 'reason':
                    reason = label.component.value || 'No reason provided';
                    break;
                case 'comment':
                    comment = label.component.value || null;
                    break;
                case 'count':
                    count = parseInt(label.component.value);
                    break;
                case 'limit':
                    limit = parseInt(label.component.value);
                    break;

            }
        }

        await this.strikePurge(
            interaction,
            await MemberWrapper.getMemberFromCustomId(interaction),
            reason,
            comment,
            count,
            limit
        );
    }

    getDescription() {
        return 'Strike a user and delete their messages in this channel';
    }

    getName() {
        return 'strike-purge';
    }
}
