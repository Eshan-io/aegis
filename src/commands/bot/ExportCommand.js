import Command from '../Command.js';
import Exporter from '../../database/export/Exporter.js';
import {AttachmentBuilder, MessageFlags, PermissionFlagsBits, PermissionsBitField} from 'discord.js';
import {gzipSync} from 'zlib';

export default class ExportCommand extends Command {

    getDefaultMemberPermissions() {
        return new PermissionsBitField()
            .add(PermissionFlagsBits.ManageGuild);
    }

    getCoolDown() {
        return 60;
    }

    async execute(interaction) {
        await interaction.deferReply({flags: MessageFlags.Ephemeral});
        const exporter = new Exporter(interaction.guild.id);
        let data = Buffer.from(await exporter.export());

        let gzip = data.byteLength > interaction.attachmentSizeLimit;
        if (gzip) {
            data = gzipSync(data);
        }

        if (data.byteLength > interaction.attachmentSizeLimit) {
            await interaction.editReply('Unable to upload exported data (file too large)!');
            return;
        }

        await interaction.editReply({
            files: [
                new AttachmentBuilder(data, {
                    name: `RoboBot-data-${interaction.guild.id}.json${gzip ? '.gz' : ''}`,
                    description: 'RoboBot data for this guild. Use /import to import on another guild or RoboBot instance'
                }),
            ]
        });
    }

    getDescription() {
        return 'Export all data RoboBot stores about this guild';
    }

    getName() {
        return 'export';
    }
}
