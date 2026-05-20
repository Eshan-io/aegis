import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from 'discord.js';
import Command from '../Command.js';
import colors from '../../util/colors.js';
import EmbedWrapper from '../../formatting/embeds/EmbedWrapper.js';
import {
    findHelpCategory,
    findHelpCommand,
    HELP_CATEGORIES,
    HELP_COMMANDS,
} from './CommandHelpData.js';

export default class HelpCommand extends Command {
    buildOptions(builder) {
        builder
            .addStringOption(option => option
                .setName('category')
                .setDescription('Command category to show')
                .setRequired(false)
                .addChoices(...HELP_CATEGORIES.map(category => ({
                    name: category.label,
                    value: category.id,
                }))))
            .addStringOption(option => option
                .setName('command')
                .setDescription('Specific command to explain')
                .setRequired(false)
                .setAutocomplete(true));
        return super.buildOptions(builder);
    }

    isAvailableInDMs() {
        return true;
    }

    async complete(interaction) {
        const focussed = interaction.options.getFocused(true);
        if (focussed.name !== 'command') {
            return [];
        }

        const value = focussed.value.toLowerCase();
        return HELP_COMMANDS
            .filter(command => command.name.includes(value))
            .slice(0, 25)
            .map(command => ({name: command.name, value: command.name}));
    }

    async execute(interaction) {
        const commandName = interaction.options.getString('command');
        const categoryId = interaction.options.getString('category');

        if (commandName) {
            await interaction.reply(this.buildCommandMessage(commandName));
            return;
        }

        if (categoryId) {
            await interaction.reply(this.buildCategoryMessage(categoryId));
            return;
        }

        await interaction.reply(this.buildOverviewMessage());
    }

    async executeButton(interaction) {
        const target = interaction.customId.split(':')[1];
        if (target === 'overview') {
            await interaction.update(this.buildOverviewMessage());
            return;
        }

        await interaction.update(this.buildCategoryMessage(target));
    }

    buildOverviewMessage() {
        const embed = new EmbedWrapper()
            .setColor(colors.GREEN)
            .setTitle('Aegis Help')
            .setDescription('Pick a category below or run `/help command:<name>` for a specific command.');

        for (const category of HELP_CATEGORIES) {
            embed.addFields({
                name: category.label,
                value: `${category.description}\nExamples: ${category.commands.slice(0, 3).map(command => `/${command.name}`).join(', ')}`,
                inline: false,
            });
        }

        return {
            ...embed.toMessage(),
            components: this.buildCategoryButtons(),
        };
    }

    buildCategoryMessage(categoryId) {
        const category = findHelpCategory(categoryId);
        if (!category) {
            return new EmbedWrapper()
                .setColor(colors.RED)
                .setTitle('Help')
                .setDescription('Unknown help category.')
                .toMessage();
        }

        const embed = new EmbedWrapper()
            .setColor(colors.GREEN)
            .setTitle(`Help: ${category.label}`)
            .setDescription(category.description);

        for (const command of category.commands) {
            embed.addFields({
                name: `/${command.name}`,
                value: `${command.description}\nUsage: \`${command.usage}\``,
                inline: false,
            });
        }

        return {
            ...embed.toMessage(),
            components: this.buildCategoryButtons(category.id),
        };
    }

    buildCommandMessage(commandName) {
        const command = findHelpCommand(commandName);
        if (!command) {
            return new EmbedWrapper()
                .setColor(colors.RED)
                .setTitle('Help')
                .setDescription('I could not find that command. Try `/help` to browse categories.')
                .toMessage();
        }

        return new EmbedWrapper()
            .setColor(colors.GREEN)
            .setTitle(`Help: /${command.name}`)
            .addFields(
                {name: 'Description', value: command.description, inline: false},
                {name: 'Usage', value: `\`${command.usage}\``, inline: false},
            )
            .toMessage();
    }

    buildCategoryButtons(active = null) {
        const rows = [];
        const overviewButton = new ButtonBuilder()
            .setLabel('Overview')
            .setStyle(active === null ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setCustomId('help:overview');
        rows.push(overviewButton);

        const categoryButtons = HELP_CATEGORIES.map(category => new ButtonBuilder()
            .setLabel(category.label)
            .setStyle(active === category.id ? ButtonStyle.Primary : ButtonStyle.Secondary)
            .setCustomId(`help:${category.id}`));

        const chunks = [categoryButtons.slice(0, 4), categoryButtons.slice(4)];
        const components = [new ActionRowBuilder().addComponents(overviewButton, ...chunks[0])];
        if (chunks[1].length) {
            components.push(new ActionRowBuilder().addComponents(...chunks[1]));
        }
        return components;
    }

    getDescription() {
        return 'Browse Aegis commands and usage';
    }

    getName() {
        return 'help';
    }
}
