import Settings from './Settings.js';
import TypeChecker from './TypeChecker.js';
import {
    bold,
    channelMention,
    Collection, HeadingLevel,
    roleMention,
} from 'discord.js';
import Punishment, {PunishmentAction} from '../database/Punishment.js';
import Zendesk from '../apis/Zendesk.js';
import {formatTime, parseTime} from '../util/timeutils.js';
import YouTubePlaylist from '../apis/YouTubePlaylist.js';
import config from '../bot/Config.js';
import {deepMerge} from '../util/util.js';
import MessageBuilder from '../formatting/MessageBuilder.js';

/**
 * @typedef {object} LevelingReward
 * @property {number} level
 * @property {import('discord.js').Snowflake} roleid
 */

/**
 * @typedef {object} LevelingSettings
 * @property {boolean} enabled
 * @property {boolean} announce
 * @property {?import('discord.js').Snowflake} channel dedicated level-up announcement channel
 * @property {number} cooldown cooldown between xp awards in seconds
 * @property {number} minXp minimum xp granted per eligible message
 * @property {number} maxXp maximum xp granted per eligible message
 * @property {LevelingReward[]} rewards level based role rewards
 */

/**
 * @typedef {object} SafeSearchSettings
 * @property {boolean} enabled
 * @property {number} strikes
 * @property {number} likelihood likelihood required for a message deletion (-3 to 2)
 */

/**
 * @typedef {object} GuildSettingsJSON
 * @property  {import('discord.js').Snowflake}   [logChannel]         id of the log channel
 * @property  {import('discord.js').Snowflake}   [messageLogChannel]  id of the message log channel
 * @property  {import('discord.js').Snowflake}   [joinLogChannel]     id of the join log channel
 * @property  {import('discord.js').Snowflake}   [mutedRole]          id of the muted role
 * @property  {import('discord.js').Snowflake[]} [modRoles]           role ids that can execute commands
 * @property  {import('discord.js').Snowflake[]} [protectedRoles]     role ids that can't be targeted by moderations
 * @property  {PunishmentsJSON}                  [punishments]        automatic punishments for strikes
 * @property  {string}                           [playlist]           id of YouTube playlist for tutorials
 * @property  {string}                           [helpcenter]         subdomain of the zendesk help center
 * @property  {boolean}                          [invites]            allow invites (can be overwritten per channel)
 * @property  {number}                           [linkCooldown]       cooldown on links in s (user based)
 * @property  {number}                           [attachmentCooldown] cooldown on attachments in s (user based)
 * @property  {boolean}                          [caps]               should caps be automatically deleted
 * @property  {number}                           [antiSpam]           should message spam detection be enabled
 * @property  {number}                           [similarMessages]    should similar message detection be enabled
 * @property  {LevelingSettings}                 [leveling]           leveling configuration
 * @property  {?SafeSearchSettings}              [safeSearch]         safe search configuration
 */

/**
 * @typedef {{[p: string]: {action: PunishmentAction, duration: number|string|null, count: ?number, message: ?number}}} PunishmentsJSON
 */

/**
 * @classdesc settings of a guild
 */
export default class GuildSettings extends Settings {

    static tableName = 'guilds';

    #punishments = {
        1: Punishment.from(PunishmentAction.MUTE, '5 minutes'),
        2: Punishment.from(PunishmentAction.MUTE, '30 minutes'),
        3: Punishment.from(PunishmentAction.MUTE, '3 hours'),
        5: Punishment.from(PunishmentAction.BAN, '1 day'),
        6: Punishment.from(PunishmentAction.BAN, '1 week'),
        7: Punishment.from(PunishmentAction.BAN, '2 weeks'),
        8: Punishment.from(PunishmentAction.BAN, '2 months'),
        9: Punishment.from(PunishmentAction.BAN, '6 months'),
        11: Punishment.from(PunishmentAction.BAN),
    };

    #defaults = {
        invites: true,
        linkCooldown: parseTime('10s'),
        attachmentCooldown: parseTime('10s'),
        caps: false,
        antiSpam: 10,
        similarMessages: 3,
        leveling: {
            enabled: false,
            announce: true,
            channel: null,
            cooldown: 60,
            minXp: 15,
            maxXp: 25,
            rewards: [],
        },
        safeSearch: {
            enabled: true,
            strikes: 1,
            likelihood: 1,
        },
    };

    /**
     * A list of role ids that can't be targeted by moderations
     * @type {Set<import('discord.js').Snowflake>}
     */
    protectedRoles = new Set();

    /**
     * @param  {import('discord.js').Snowflake}   id                        guild id
     * @param  {GuildSettingsJSON}                [json]                 json object
     * @returns {GuildSettings}
     */
    constructor(id, json = {}) {
        super(id);
        json = deepMerge(json, this.#defaults);

        for (const setting of [
            // logging
            'logChannel',
            'messageLogChannel',
            'joinLogChannel',
            // roles
            'mutedRole',
            // external
            'playlist',
            'helpcenter',
            // automod
            'invites',
            'linkCooldown',
            'attachmentCooldown',
            'caps',
            'antiSpam',
            'similarMessages',
            'leveling',
            'safeSearch',
        ]) {
            this[setting] = json[setting];
        }

        if (json.protectedRoles instanceof Array)
            this.protectedRoles = new Set(json.protectedRoles);
        if (json.modRoles instanceof Array)
            json.modRoles.forEach(role => this.protectedRoles.add(role));

        this.#punishments = this.#parsePunishments(json.punishments ?? this.#punishments);
    }

    /**
     * check if the types of this object are a valid guild settings
     * @param {object} json
     * @throws {TypeError} incorrect types
     */
    static checkTypes(json) {
        TypeChecker.assertOfTypes(json, ['object'], 'Data object');

        TypeChecker.assertStringUndefinedOrNull(json.logChannel, 'Log channel');
        TypeChecker.assertStringUndefinedOrNull(json.messageLogChannel, 'Message log channel');
        TypeChecker.assertStringUndefinedOrNull(json.mutedRole, 'Muted role');

        if (!(json.protectedRoles instanceof Array) || !json.protectedRoles.every(r => typeof r === 'string')) {
            throw new TypeError('Protected roles must be an array of strings!');
        }

        if (!(json.punishments instanceof Object) ||
            !Object.values(json.punishments).every(punishment => ['ban', 'kick', 'mute', 'softban', 'strike'].includes(punishment.action))) {
            throw new TypeError('Invalid punishments');
        }

        TypeChecker.assertStringUndefinedOrNull(json.playlist, 'Playlist');
        TypeChecker.assertStringUndefinedOrNull(json.helpcenter, 'Help center');

        TypeChecker.assertOfTypes(json.invites, ['boolean', 'undefined'], 'Invites');
        TypeChecker.assertNumberUndefinedOrNull(json.linkCooldown, 'Link cooldown');
        TypeChecker.assertNumberUndefinedOrNull(json.attachmentCooldown, 'Attachment cooldown');
        TypeChecker.assertNumberUndefinedOrNull(json.antiSpam, 'Anti Spam');
        TypeChecker.assertNumberUndefinedOrNull(json.similarMessages, 'Similar Messages');
        TypeChecker.assertOfTypes(json.leveling, ['object', 'undefined'], 'Leveling', true);
        if (typeof json.leveling === 'object') {
            if (typeof json.leveling.enabled !== 'boolean' || typeof json.leveling.announce !== 'boolean') {
                throw new TypeError('Invalid leveling configuration');
            }
            TypeChecker.assertStringUndefinedOrNull(json.leveling.channel, 'Leveling channel');
            TypeChecker.assertNumberUndefinedOrNull(json.leveling.cooldown, 'Leveling cooldown');
            TypeChecker.assertNumberUndefinedOrNull(json.leveling.minXp, 'Leveling minimum XP');
            TypeChecker.assertNumberUndefinedOrNull(json.leveling.maxXp, 'Leveling maximum XP');
            if (
                (json.leveling.rewards !== undefined && !(json.leveling.rewards instanceof Array)) ||
                (json.leveling.rewards instanceof Array && !json.leveling.rewards.every(reward =>
                    typeof reward === 'object' &&
                    typeof reward.roleid === 'string' &&
                    typeof reward.level === 'number'
                ))
            ) {
                throw new TypeError('Invalid leveling rewards');
            }
        }
        TypeChecker.assertOfTypes(json.safeSearch, ['object', 'undefined'], 'Safe Search', true);
        if (typeof json.safeSearch === 'object') {
            if (typeof json.safeSearch.enabled !== 'boolean') {
                throw new TypeError('Invalid safe search configuration');
            }
            TypeChecker.assertNumberUndefinedOrNull(json.safeSearch.strikes, 'Safe Search');
        }
    }

    /**
     * @param {string} id
     * @returns {Promise<GuildSettings>}
     */
    static async get(id) {
        return super.get(id);
    }

    /**
     * generate a settings embed
     * @param {MessageBuilder} message
     * @returns {MessageBuilder}
     */
    getSettings(message) {
        return message
            .heading('Moderation', HeadingLevel.Three)
            .emojiList(...this.getModerationSettings())
            .separator()
            .heading('Protected Roles', HeadingLevel.Three)
            .listOr('None', ...this.getProtectedRoles())
            .separator()
            .heading('Automod', HeadingLevel.Three)
            .list(...this.getAutoModSettings())
            .separator()
            .heading('Leveling', HeadingLevel.Three)
            .list(...this.getLevelingSettings())
            .separator()
            .heading('Connections', HeadingLevel.Three)
            .emojiList(...this.getConnectionsSettings());
    }

    /**
     * generate an overview of moderation settings
     * @returns {string[]}
     */
    getModerationSettings() {
        return [
            'channel', `Log: ${this.logChannel ? channelMention(this.logChannel) : 'disabled'}`,
            'channel', `Message Log: ${this.messageLogChannel ? channelMention(this.messageLogChannel) : 'disabled'}`,
            'channel', `Join Log: ${this.joinLogChannel ? channelMention(this.joinLogChannel) : 'disabled'}`,
            'mute', `Muted role: ${this.mutedRole ? roleMention(this.mutedRole) : 'disabled'}`,
        ];
    }

    /**
     * Get the protected roles formatted as mentions
     * @returns {string[]}
     */
    getProtectedRoles() {
        return Array.from(this.protectedRoles).map(roleMention);
    }

    /**
     * generate an overview of connection settings
     * @returns {string[]}
     */
    getConnectionsSettings() {
        return [
            'youtube', `Playlist: ${this.playlist ? this.getPlaylist().getFormattedUrl() : 'disabled'}`,
            'zendesk', `Helpcenter: ${this.helpcenter ? `https://${this.helpcenter}.zendesk.com/` : 'disabled'}`,
        ];
    }

    /**
     * generate an overview of automod settings
     * @returns {string[]}
     */
    getAutoModSettings() {
        const lines = [
            `Invites: ${this.invites ? 'allowed' : 'forbidden'}`,
            `Link cooldown: ${this.linkCooldown !== -1 ? formatTime(this.linkCooldown) : 'disabled'}`,
            `Attachment cooldown: ${this.attachmentCooldown !== -1 ? formatTime(this.attachmentCooldown) : 'disabled'}`,
            `Caps: ${this.caps ? 'forbidden' : 'allowed'}`,
            `Spam protection: ${this.antiSpam === -1 ? 'disabled' : `${this.antiSpam} messages per minute`}`,
            `Repeated message protection: ${this.similarMessages === -1 ? 'disabled' : `${this.similarMessages} similar messages per minute`}`,
        ];

        if (this.isFeatureWhitelisted) {
            if (this.safeSearch.enabled) {
                lines.push(`Safe search: enabled for images ${this.displayLikelihood()} nsfw content (${this.safeSearch.strikes} strikes)`);
            } else {
                lines.push('Safe search: disabled');
            }
        }

        return lines;
    }

    /**
     * generate an overview of leveling settings
     * @returns {string[]}
     */
    getLevelingSettings() {
        const rewards = this.getLevelingRewardEntries();
        return [
            `Enabled: ${this.leveling.enabled ? 'yes' : 'no'}`,
            `Level-up announcements: ${this.leveling.announce ? 'yes' : 'no'}`,
            `Announcement channel: ${this.leveling.channel ? channelMention(this.leveling.channel) : 'same channel'}`,
            `XP cooldown: ${formatTime(this.leveling.cooldown)}`,
            `XP per message: ${this.leveling.minXp}-${this.leveling.maxXp}`,
            `Reward roles: ${rewards.length ? rewards.map(reward => `Lvl ${reward.level}: ${roleMention(reward.roleid)}`).join(', ') : 'none'}`,
        ];
    }

    /**
     * @returns {LevelingReward[]}
     */
    getLevelingRewardEntries() {
        return [...(this.leveling.rewards ?? [])]
            .filter(reward => reward && typeof reward.roleid === 'string' && typeof reward.level === 'number')
            .sort((a, b) => a.level - b.level);
    }

    /**
     * @param {number} level
     * @returns {?LevelingReward}
     */
    getLevelingReward(level) {
        let current = null;
        for (const reward of this.getLevelingRewardEntries()) {
            if (reward.level > level) {
                break;
            }
            current = reward;
        }
        return current;
    }

    /**
     * @param {number} level
     * @returns {?import('discord.js').Snowflake}
     */
    getLevelingRewardRole(level) {
        return this.getLevelingReward(level)?.roleid ?? null;
    }

    /**
     * @returns {import('discord.js').Snowflake[]}
     */
    getLevelingRewardRoleIds() {
        return this.getLevelingRewardEntries().map(reward => reward.roleid);
    }

    displayLikelihood() {
        switch (this.safeSearch.likelihood) {
            case 0:
                return `${bold('possibly')} containing`;
            case 1:
                return `${bold('likely')} to contain`;
            case 2:
                return `${bold('very likely')} to contain`;
        }
    }

    /**
     * is this guild in the feature whitelist
     * @returns {boolean}
     */
    get isFeatureWhitelisted() {
        return config.data.featureWhitelist.includes(this.id);
    }

    /**
     * Is this member protected?
     * @async
     * @param {import('discord.js').GuildMember} member member object of the user in the specific guild
     * @returns {boolean}
     */
    isProtected(member) {
        for (let [key] of member.roles.cache) {
            if (this.protectedRoles.has(key))
                return true;
        }
        return false;
    }

    /**
     * get a specific punishment
     * @param {number} strikes
     * @returns {?Punishment}
     */
    getPunishment(strikes) {
        if (!this.#punishments[strikes]) {
            return null;
        }

        return new Punishment(this.#punishments[strikes]);
    }

    /**
     * find the last punishment
     * @param {number} strikes
     * @returns {Punishment}
     */
    findPunishment(strikes) {
        let punishment;
        do {
            punishment = this.getPunishment(strikes);
            strikes--;
        } while (!punishment && strikes > 0);
        return punishment;
    }

    /**
     * set a punishment
     * @param {number} strikes
     * @param {?Punishment} punishment
     * @returns {Promise<void>}
     */
    setPunishment(strikes, punishment) {
        if (punishment === null)
            delete this.#punishments[strikes];
        else
            this.#punishments[strikes] = punishment;
        return this.save();
    }

    /**
     * get all punishments
     * @returns {Collection<number, Punishment>}
     */
    getPunishments() {
        const punishments = new Collection();

        for (const key of Object.keys(this.#punishments)) {
            punishments.set(parseInt(key), this.#punishments[key]);
        }

        return punishments;
    }

    /**
     * get the zendesk instance for this guild
     * @returns {Zendesk}
     */
    getZendesk() {
        if (!this.helpcenter) {
            return null;
        }

        return new Zendesk(this.helpcenter);
    }

    /**
     * get the YouTube playlist for this guild
     * @returns {YouTubePlaylist}
     */
    getPlaylist() {
        if (!this.playlist) {
            return null;
        }

        return new YouTubePlaylist(this.playlist);
    }

    /**
     * @returns {null|import('discord.js').Snowflake}
     */
    getMutedRole() {
        return this.mutedRole ?? null;
    }

    getDataObject(o = this) {
        //copy to new object
        const cleanObject = {};
        Object.assign(cleanObject, o);

        //copy private properties
        cleanObject.punishments = this.#punishments;

        //convert set to array
        cleanObject.protectedRoles = Array.from(this.protectedRoles);

        return super.getDataObject(cleanObject);
    }

    /**
     * Parse punishment data to objects
     * @param {PunishmentsJSON} input
     * @returns {{[p: string]: Punishment}}
     */
    #parsePunishments(input) {
        const output = {};
        for (const [key, value] of Object.entries(input)) {
            if (typeof value.duration === "string") {
                output[key] = Punishment.from(value.action, value.duration, value.message);
            } else {
                output[key] = new Punishment(value);
            }
        }
        return output;
    }
}
