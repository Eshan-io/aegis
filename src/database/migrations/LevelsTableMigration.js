import Migration from './Migration.js';

export default class LevelsTableMigration extends Migration {
    async check() {
        const result = await this.database.query(`
SELECT COUNT(1) AS tableExists
FROM INFORMATION_SCHEMA.TABLES
WHERE table_schema = DATABASE()
  AND table_name = 'levels'
`);

        return result.tableExists === '0';
    }

    async run() {
        await this.database.query(`
CREATE TABLE \`levels\`
(
    \`guildid\`     VARCHAR(20) NOT NULL,
    \`userid\`      VARCHAR(20) NOT NULL,
    \`xp\`          INT         NOT NULL DEFAULT 0,
    \`level\`       INT         NOT NULL DEFAULT 0,
    \`lastMessage\` BIGINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (\`guildid\`, \`userid\`)
)`);
    }
}
