import SubCommand from '../../SubCommand.js';
import GuildSettings from '../../../settings/GuildSettings.js';
import ErrorEmbed from '../../../formatting/embeds/ErrorEmbed.js';
import {getEmbed} from './ShowLevelingCommand.js';

export default class SetLevelingCommand extends SubCommand {
    buildOptions(builder) {
        builder.addBooleanOption(option => option
            .setName('enabled')
            .setDescription('Should the leveling module award XP?')
        );
        builder.addBooleanOption(option => option
            .setName('announce')
            .setDescription('Should the bot announce level-ups?')
        );
        builder.addIntegerOption(option => option
            .setName('cooldown')
            .setDescription('Cooldown between XP rewards in seconds')
            .setMinValue(1)
            .setMaxValue(3600)
        );
        builder.addIntegerOption(option => option
            .setName('min-xp')
            .setDescription('Minimum XP granted for an eligible message')
            .setMinValue(1)
            .setMaxValue(1000)
        );
        builder.addIntegerOption(option => option
            .setName('max-xp')
            .setDescription('Maximum XP granted for an eligible message')
            .setMinValue(1)
            .setMaxValue(1000)
        );
        return super.buildOptions(builder);
    }

    async execute(interaction) {
        const enabled = interaction.options.getBoolean('enabled');
        const announce = interaction.options.getBoolean('announce');
        const cooldown = interaction.options.getInteger('cooldown');
        const minXp = interaction.options.getInteger('min-xp');
        const maxXp = interaction.options.getInteger('max-xp');

        if ([enabled, announce, cooldown, minXp, maxXp].every(value => value === null)) {
            await interaction.reply(ErrorEmbed.message('Provide at least one option to update.'));
            return;
        }

        const guildSettings = await GuildSettings.get(interaction.guildId);
        const next = {...guildSettings.leveling};

        if (enabled !== null) {
            next.enabled = enabled;
        }
        if (announce !== null) {
            next.announce = announce;
        }
        if (cooldown !== null) {
            next.cooldown = cooldown;
        }
        if (minXp !== null) {
            next.minXp = minXp;
        }
        if (maxXp !== null) {
            next.maxXp = maxXp;
        }

        if (next.maxXp < next.minXp) {
            await interaction.reply(ErrorEmbed.message('Maximum XP must be greater than or equal to minimum XP.'));
            return;
        }

        guildSettings.leveling = next;
        await guildSettings.save();
        await interaction.reply(getEmbed(guildSettings));
    }

    getDescription() {
        return 'Update leveling settings';
    }

    getName() {
        return 'set';
    }
}
