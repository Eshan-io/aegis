import {bold, escapeMarkdown, PermissionFlagsBits, PermissionsBitField,} from 'discord.js';
import MemberWrapper from '../../discord/MemberWrapper.js';
import colors from '../../util/colors.js';
import {MODAL_TITLE_LIMIT} from '../../util/apiLimits.js';
import UserCommand from './UserCommand.js';
import Confirmation from '../../database/Confirmation.js';
import {inLimits} from '../../util/util.js';
import EmbedWrapper from '../../formatting/embeds/EmbedWrapper.js';
import {formatNumber, inlineEmojiIfExists} from '../../util/format.js';
import {deferReplyOnce, replyOrEdit} from '../../util/interaction.js';
import ReasonInput from "../../formatting/components/ReasonInput.js";
import CommentInput from "../../formatting/components/CommentInput.js";
import BetterModalBuilder from "../../formatting/components/BetterModalBuilder.js";
import StrikeCountInput from "../../formatting/components/StrikeCountInput.js";

/**
 * @import {ConfirmationData} from './UserCommand.js';
 */

/**
 * @typedef {ConfirmationData} StrikeConfirmationData
 * @property {?number} count
 */

export default class StrikeCommand extends UserCommand {

    /**
     * add options to slash command builder
     * @param {import('discord.js').SlashCommandBuilder} builder
     * @returns {import('discord.js').SlashCommandBuilder}
     */
    buildOptions(builder) {
        super.buildOptions(builder);
        builder.addIntegerOption(option =>
            option.setName('count')
                .setDescription('Strike count')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(100)
        );
        return builder;
    }

    getDefaultMemberPermissions() {
        return new PermissionsBitField()
            .add(PermissionFlagsBits.ModerateMembers);
    }

    getRequiredBotPermissions() {
        return new PermissionsBitField()
            .add(PermissionFlagsBits.ModerateMembers);
    }

    supportsUserCommands() {
        return true;
    }

    async execute(interaction) {
        await this.strike(interaction,
            new MemberWrapper(interaction.options.getUser('user', true), interaction.guild),
            interaction.options.getString('reason'),
            interaction.options.getString('comment'),
            interaction.options.getInteger('count'),
        );
    }

    /**
     *
     * @param {import('discord.js').Interaction} interaction
     * @param {?MemberWrapper} member
     * @param {?string} reason
     * @param {?string} comment
     * @param {?number} count
     * @returns {Promise<void>}
     */
    async strike(interaction, member, reason, comment, count) {
        await deferReplyOnce(interaction);
        reason = reason || 'No reason provided';
        count = inLimits(count, 1, 100);

        if (!await this.checkPermissions(interaction, member) ||
            !await this.preventDuplicateModeration(interaction, member, {reason, comment, count})) {
            return;
        }

        await member.strike(reason, comment, interaction.user, count);
        await replyOrEdit(interaction, new EmbedWrapper()
            .setDescription(inlineEmojiIfExists('strike') +
                `${bold(escapeMarkdown(await member.displayName()))} has received ${formatNumber(count, 'strike')}: ${reason}`)
            .setColor(colors.RED)
            .toMessage()
        );
    }

    async executeButton(interaction) {
        const parts = interaction.customId.split(':');
        if (parts[1] === 'confirm') {
            /** @type {Confirmation<StrikeConfirmationData>}*/
            const data = await Confirmation.get(parts[2]);
            if (!data) {
                await interaction.update({content: 'This confirmation has expired.', embeds: [], components: []});
                return;
            }

            await this.strike(
                interaction,
                await MemberWrapper.getMember(interaction, data.data.user),
                data.data.reason,
                data.data.comment,
                data.data.count,
            );
            return;
        }

        await this.promptForData(interaction, await MemberWrapper.getMemberFromCustomId(interaction));
    }

    async executeUserMenu(interaction) {
        const member = new MemberWrapper(interaction.targetUser, interaction.guild);
        await this.promptForData(interaction, member);
    }

    /**
     * prompt user for strike reason and count
     * @param {import('discord.js').Interaction} interaction
     * @param {?MemberWrapper} member
     * @returns {Promise<void>}
     */
    async promptForData(interaction, member) {
        if (!member) {
            return;
        }

        await interaction.showModal(new BetterModalBuilder()
            .setTitle(`Strike ${await member.displayName()}`.substring(0, MODAL_TITLE_LIMIT))
            .setCustomId(`strike:${member.user.id}`)
            .addLabelComponent(new ReasonInput(this))
            .addLabelComponent(new CommentInput(this))
            .addLabelComponent(new StrikeCountInput("The number of strikes you want to give to this user"))
        );
    }

    async executeModal(interaction) {
        let reason, comment, count;
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
            }
        }

        await this.strike(
            interaction,
            await MemberWrapper.getMemberFromCustomId(interaction),
            reason,
            comment,
            count
        );
    }

    getDescription() {
        return 'Strike a user and execute a punishment based on the amount of strikes the user currently has.';
    }

    getName() {
        return 'strike';
    }
}
