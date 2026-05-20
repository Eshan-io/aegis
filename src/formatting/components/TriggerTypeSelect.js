import {LabelBuilder} from "discord.js";
import BetterStringSelectMenuBuilder from "./BetterStringSelectMenuBuilder.js";

export default class TriggerTypeSelect extends LabelBuilder {
    /**
     * @param {?import('../../database/ChatTriggeredFeature.js').default} existing
     */
    constructor(existing) {
        super();

        /** @type {import('discord.js').APISelectMenuOption[]} */
        const options = [
            {
                label: 'Include',
                description: 'The message must include the trigger. Upper/lower-case is ignored.',
                value: 'include'
            },
            {
                label: 'Match',
                description: 'The full message must match the trigger. Upper/lower-case is ignored.',
                value: 'match'
            },
            {
                label: 'Regular expression',
                description: 'The message must match the provided regular expression (JS Syntax)',
                value: 'regex'
            },
            {
                label: 'Phishing domains (e.g. "discord.com(gg):0.8")',
                description: 'Match similar domains (e.g. "discord.com(gg):0.8")',
                value: 'phishing'
            }
        ];

        const select = new BetterStringSelectMenuBuilder()
            .setCustomId("trigger-type");
        const defaultOption = existing?.trigger?.type ?? "include";

        for (const option of options) {
            if (option.value === defaultOption) {
                option.default = true;
            }
            select.addOption(option);
        }

        this.setLabel('Trigger Type')
            .setDescription("The kind of trigger")
            .setStringSelectMenuComponent(select);
    }
}
