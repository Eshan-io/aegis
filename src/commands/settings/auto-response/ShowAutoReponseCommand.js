import AutoResponse from '../../../database/AutoResponse.js';
import ErrorEmbed from '../../../formatting/embeds/ErrorEmbed.js';
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags} from 'discord.js';
import CompletingAutoResponseCommand from './CompletingAutoResponseCommand.js';

export default class ShowAutoReponseCommand extends CompletingAutoResponseCommand {
    async execute(interaction) {
        const autoResponse = /** @type {?AutoResponse} */
            await AutoResponse.getByID(interaction.options.getInteger('id', true), interaction.guildId);

        if (!autoResponse) {
            await interaction.reply(ErrorEmbed.message('There is no auto-response with this id.'));
            return;
        }

        await interaction.reply({
            flags: MessageFlags.Ephemeral,
            embeds: [autoResponse.embed()],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        // eslint-disable-next-line jsdoc/reject-any-type
                        /** @type {*} */
                        new ButtonBuilder()
                            .setLabel('Remove')
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId(`response:remove:${autoResponse.id}`),
                        // eslint-disable-next-line jsdoc/reject-any-type
                        /** @type {*} */
                        new ButtonBuilder()
                            .setLabel('Edit')
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`response:edit:${autoResponse.id}`)
                    )
            ]
        });
    }

    getDescription() {
        return 'View a single auto-response';
    }

    getName() {
        return 'view';
    }
}
