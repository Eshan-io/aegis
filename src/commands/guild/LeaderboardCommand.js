import Command from '../Command.js';
import Level from '../../database/Level.js';
import LineEmbed from '../../formatting/embeds/LineEmbed.js';
import colors from '../../util/colors.js';
import {userMention} from 'discord.js';

export default class LeaderboardCommand extends Command {
    async execute(interaction) {
        const leaderboard = await Level.getLeaderboard(interaction.guildId);
        const embed = new LineEmbed()
            .setTitle('Leaderboard')
            .setColor(colors.ORANGE);

        if (!leaderboard.length) {
            embed.setDescription('Nobody has earned any XP yet.');
            await interaction.reply(embed.toMessage());
            return;
        }

        leaderboard.forEach((entry, index) => {
            embed.addLine(
                `#${index + 1} ${userMention(entry.userid)} - Level ${entry.level} (${entry.xp}/${entry.xpToNextLevel} XP)`
            );
        });

        await interaction.reply(embed.toMessage());
    }

    getDescription() {
        return 'Show the leveling leaderboard for this guild';
    }

    getName() {
        return 'leaderboard';
    }
}
