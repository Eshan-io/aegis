import database from './Database.js';
import TypeChecker from '../settings/TypeChecker.js';

export default class Level {
    guildid;
    userid;
    xp;
    level;
    lastMessage;

    /**
     * @param {object} data
     * @param {import('discord.js').Snowflake} data.guildid
     * @param {import('discord.js').Snowflake} data.userid
     * @param {number|string} [data.xp]
     * @param {number|string} [data.level]
     * @param {number|string} [data.lastMessage]
     */
    constructor(data) {
        this.guildid = data.guildid;
        this.userid = data.userid;
        this.xp = parseInt(data.xp) || 0;
        this.level = parseInt(data.level) || 0;
        this.lastMessage = parseInt(data.lastMessage) || 0;
    }

    /**
     * @param {object} json
     */
    static checkTypes(json) {
        TypeChecker.assertOfTypes(json, ['object'], 'Data object');
        TypeChecker.assertString(json.guildid, 'Guild ID');
        TypeChecker.assertString(json.userid, 'User ID');
        TypeChecker.assertOfTypes(json.xp, ['number', 'string', 'undefined'], 'XP');
        TypeChecker.assertOfTypes(json.level, ['number', 'string', 'undefined'], 'Level');
        TypeChecker.assertOfTypes(json.lastMessage, ['number', 'string', 'undefined'], 'Last message');
    }

    /**
     * @param {import('discord.js').Snowflake} guildId
     * @param {import('discord.js').Snowflake} userId
     * @returns {Promise<Level>}
     */
    static async get(guildId, userId) {
        const data = await database.query(
            'SELECT guildid, userid, xp, level, lastMessage FROM levels WHERE guildid = ? AND userid = ?',
            guildId, userId
        );

        return new Level(data ?? {guildid: guildId, userid: userId});
    }

    /**
     * @param {import('discord.js').Snowflake} guildId
     * @param {number} [limit]
     * @returns {Promise<Level[]>}
     */
    static async getLeaderboard(guildId, limit = 10) {
        return (await database.queryAll(
            'SELECT guildid, userid, xp, level, lastMessage FROM levels WHERE guildid = ? ORDER BY level DESC, xp DESC, lastMessage ASC LIMIT ?',
            guildId, limit
        )).map(row => new Level(row));
    }

    /**
     * @param {import('discord.js').Snowflake} guildId
     * @returns {Promise<Level[]>}
     */
    static async getAll(guildId) {
        return (await database.queryAll(
            'SELECT guildid, userid, xp, level, lastMessage FROM levels WHERE guildid = ? ORDER BY level DESC, xp DESC',
            guildId
        )).map(row => new Level(row));
    }

    /**
     * @param {import('discord.js').Snowflake} guildId
     * @param {import('discord.js').Snowflake} userId
     * @returns {Promise<?number>}
     */
    static async getRank(guildId, userId) {
        const level = await this.get(guildId, userId);
        if (level.level === 0 && level.xp === 0) {
            return null;
        }

        const result = await database.query(
            `SELECT COUNT(*) + 1 AS rank
             FROM levels
             WHERE guildid = ?
               AND (level > ? OR (level = ? AND xp > ?))`,
            guildId, level.level, level.level, level.xp
        );

        return parseInt(result.rank);
    }

    /**
     * XP required to reach the next level from the current one
     * @param {number} level
     * @returns {number}
     */
    static xpForNextLevel(level) {
        return 100 + (level * 50);
    }

    /**
     * @param {number} level
     * @returns {number}
     */
    static totalXpForLevel(level) {
        let total = 0;
        for (let i = 0; i < level; i++) {
            total += this.xpForNextLevel(i);
        }
        return total;
    }

    /**
     * @returns {number}
     */
    get totalXp() {
        return this.constructor.totalXpForLevel(this.level) + this.xp;
    }

    /**
     * @returns {number}
     */
    get xpToNextLevel() {
        return this.constructor.xpForNextLevel(this.level);
    }

    /**
     * @returns {number}
     */
    get remainingXp() {
        return this.xpToNextLevel - this.xp;
    }

    /**
     * @param {number} amount
     * @param {number} timestamp
     * @returns {number} amount of levels gained
     */
    addXp(amount, timestamp) {
        this.xp += amount;
        this.lastMessage = timestamp;

        let levelUps = 0;
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            levelUps++;
        }

        return levelUps;
    }

    /**
     * @returns {Promise<void>}
     */
    async save() {
        const result = await database.query(
            'SELECT 1 AS `exists` FROM levels WHERE guildid = ? AND userid = ?',
            this.guildid, this.userid
        );

        if (result) {
            await database.query(
                'UPDATE levels SET xp = ?, level = ?, lastMessage = ? WHERE guildid = ? AND userid = ?',
                this.xp, this.level, this.lastMessage, this.guildid, this.userid
            );
            return;
        }

        await database.query(
            'INSERT INTO levels (guildid, userid, xp, level, lastMessage) VALUES (?, ?, ?, ?, ?)',
            this.guildid, this.userid, this.xp, this.level, this.lastMessage
        );
    }

    /**
     * @param {Level[]} levels
     * @returns {Promise<void>}
     */
    static async bulkSave(levels) {
        if (!Array.isArray(levels) || !levels.length) {
            return;
        }

        const values = levels.flatMap(level => [
            level.guildid,
            level.userid,
            level.xp,
            level.level,
            level.lastMessage,
        ]);

        await database.queryAll(
            `INSERT INTO levels (guildid, userid, xp, level, lastMessage) VALUES ${
                '(?, ?, ?, ?, ?), '.repeat(levels.length).slice(0, -2)
            }`,
            ...values
        );
    }
}
