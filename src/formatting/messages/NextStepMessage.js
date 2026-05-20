import MessageBuilder from "../MessageBuilder.js";
import BetterButtonBuilder from "../embeds/BetterButtonBuilder.js";
import {componentEmojiIfExists} from "../../util/format.js";
import icons from "../../util/icons.js";
import {ButtonStyle, MessageFlags} from "discord.js";

/**
 * @implements {import('discord.js').InteractionReplyOptions}
 */
export default class NextStepMessage {
    flags = MessageFlags.Ephemeral | MessageFlags.IsComponentsV2;
    components = [];

    /**
     * @param {number} completedSteps number of completed steps
     * @param {number} totalSteps total number of steps
     * @param {string} customId custom id for the button to trigger the next step
     */
    constructor(completedSteps, totalSteps, customId) {
        this.components.push(new MessageBuilder().text("Completed Step")
            .space()
            .text(completedSteps.toString())
            .space()
            .text("of")
            .space()
            .text(totalSteps.toString())
            .text(".")
            .newLine()
            .button(new BetterButtonBuilder()
                .setEmojiIfPresent(componentEmojiIfExists("nextPage", icons.right))
                .setLabel("Continue")
                .setCustomId(customId)
                .setStyle(ButtonStyle.Primary)
            )
            .endComponent());
    }
}
