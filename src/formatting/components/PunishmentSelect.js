import {LabelBuilder} from "discord.js";
import BetterStringSelectMenuBuilder from "./BetterStringSelectMenuBuilder.js";

export default class PunishmentSelect extends LabelBuilder {
    /**
     * @param {?import('../../database/BadWord.js').default} existing
     */
    constructor(existing = null) {
        super();

        /** @type {import('discord.js').APISelectMenuOption[]} */
        const options = [
            {
                label: 'None',
                description: 'No punishment.',
                value: 'none'
            },
            {
                label: 'Strike',
                description: 'The user will receive a strike.',
                value: 'strike'
            },
            {
                label: 'Ban',
                description: 'The user will be banned. An option duration can be specified in the next step.',
                value: 'ban'
            },
            {
                label: 'Mute',
                description: 'The user will be muted. An option duration can be specified in the next step.',
                value: 'mute'
            },
            {
                label: 'Kick',
                description: 'The user will be kicked from the server.',
                value: 'kick'
            },
            {
                label: 'Softban',
                description: 'The user will be kicked and all their recent messages will be deleted.',
                value: 'softban'
            }
        ];

        const select = new BetterStringSelectMenuBuilder()
            .setCustomId("punishment");
        const defaultOption = existing?.punishment?.action ?? "none";

        for (const option of options) {
            if (option.value === defaultOption) {
                option.default = true;
            }
            select.addOption(option);
        }

        this.setLabel('Punishment')
            .setDescription("Punishment for users that trigger this bad-word.")
            .setStringSelectMenuComponent(select);
    }
}
