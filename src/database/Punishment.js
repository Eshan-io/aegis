import {parseTime} from '../util/timeutils.js';

export default class Punishment {
    /**
     * @type {PunishmentAction}
     */
    action;

    /**
     * @type {?number}
     */
    duration = null;

    /**
     * Number of strikes to apply if this is a strike punishment
     * @type {?number}
     */
    count = null;

    /**
     * @type {?string}
     * @deprecated
     */
    message = null;

    /**
     * @param {object} raw
     * @param {PunishmentAction} raw.action
     * @param {?number} [raw.duration] Duration in seconds if this is a ban or mute
     * @param {?number} [raw.count] number of strikes to apply if this is a strike punishment
     * @param {?string} [raw.message]
     */
    constructor(raw) {
        this.action = raw.action;
        this.duration = raw.duration ?? null;
        this.count = raw.count ?? null;
        this.message = raw.message ?? null;
    }

    /**
     * create a new punishment
     * @param {PunishmentAction} action
     * @param {?string} duration
     * @param {?string} message
     * @returns {Punishment}
     */
    static from(action, duration = null, message = null) {
        return new this({action, duration: parseTime(duration), message});
    }
}

/**
 * Possible actions for punishments
 * @enum {string}
 */
export const PunishmentAction = {
    BAN: 'ban',
    KICK: 'kick',
    MUTE: 'mute',
    SOFTBAN: 'softban',
    STRIKE: 'strike',
    NONE: 'none',
};
