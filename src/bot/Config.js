import logger from './Logger.js';
import {exists, readJSON} from '../util/fsutils.js';

/**
 * @typedef {object} ConfigData
 * @property {string} authToken
 * @property {DatabaseConfig} database
 * @property {?string} googleApiKey
 * @property {?GoogleCloudConfig} googleCloud
 * @property {string[]} featureWhitelist
 * @property {Emojis} emoji emoji ids
 */

/**
 * @typedef {object} GoogleCloudConfig
 * @property {GoogleCloudCredentials} credentials
 * @property {CloudLoggingConfig} logging
 * @property {VisionConfig} vision
 */

/**
 * @typedef {object} DatabaseConfig
 * @property {string} host
 * @property {string} user
 * @property {string} password
 * @property {string} database
 * @property {number} port
 */

/**
 * @typedef {object} VisionConfig
 * @property {boolean} enabled
 */

/**
 * @typedef {object} CloudLoggingConfig google cloud monitoring
 * @property {boolean} enabled
 * @property {string} projectId
 * @property {string} logName
 */

/**
 * @typedef {object} GoogleCloudCredentials
 * @property {string} client_email
 * @property {string} private_key
 */

/**
 * @typedef {object} Emojis
 * @property {?string} source
 * @property {?string} privacy
 * @property {?string} invite
 * @property {?string} discord
 * @property {?string} youtube
 * @property {?string} zendesk
 * @property {?string} firstPage
 * @property {?string} previousPage
 * @property {?string} refresh
 * @property {?string} nextPage
 * @property {?string} lastPage
 * @property {?string} announcement
 * @property {?string} channel
 * @property {?string} forum
 * @property {?string} stage
 * @property {?string} thread
 * @property {?string} voice
 * @property {?string} avatar
 * @property {?string} ban
 * @property {?string} moderations
 * @property {?string} mute
 * @property {?string} pardon
 * @property {?string} strike
 * @property {?string} kick
 * @property {?string} userCreated
 * @property {?string} userId
 * @property {?string} userJoined
 */

export class Config {
    /**
     * @type {object}
     */
    #configFile;

    /**
     * @type {ConfigData}
     */
    #data;

    /**
     * @type {boolean}
     */
    #envLoaded = false;

    /**
     * @returns {ConfigData}
     */
    get data() {
        return this.#data;
    }

    async load() {
        await this.#loadEnvFile();

        /** @type {string} */
        const authToken = await this.#get("authToken");
        if (!authToken || typeof authToken !== "string" || authToken.length < 32) {
            await logger.error('No valid auth token found.\nConfigure auth token as described in the CONFIGURATION.md');
            process.exit(1);
        }

        /** @type {DatabaseConfig} */
        let database = await this.#get('database', {}, this.#parseBase64Json);
        database.host ??= await this.#get(['database', 'host']);
        database.user ??= await this.#get(['database', 'user'], "aegis");
        database.password ??= await this.#get(['database', 'password']);
        database.database ??= await this.#get(['database', 'database']);
        database.database ??= process.env.AEGIS_DATABASE_NAME;
        database.database ??= "aegis";
        database.port ??= await this.#get(['database', 'port'], 3306, parseInt);
        if (typeof database !== 'object' || !database.host) {
            await logger.error('No valid database host provided.\nConfigure database as described in the CONFIGURATION.md');
            process.exit(1);
        }

        /** @type {GoogleCloudCredentials} */
        let googleCloudCredentials = await this.#get(['googleCloud', 'credentials'], null, this.#parseBase64Json);
        if (!googleCloudCredentials) {
            googleCloudCredentials = {
                client_email: await this.#get(['googleCloud', 'credentials', 'client_email']),
                private_key: (await this.#get(['googleCloud', 'credentials', 'private_key']))?.replaceAll('\\n', '\n'),
            };
        }

        this.#data = {
            authToken,
            database,
            googleApiKey: await this.#get('googleApiKey'),
            googleCloud: {
                credentials: googleCloudCredentials,
                vision: {
                    enabled: await this.#get(['googleCloud', 'vision', 'enabled'], false, this.#parseBooleanFromEnv)
                },
                logging: {
                    enabled: await this.#get(['googleCloud', 'logging', 'enabled'], false, this.#parseBooleanFromEnv),
                    projectId: await this.#get(['googleCloud', 'logging', 'projectId']),
                    logName: await this.#get(['googleCloud', 'logging', 'logName']),
                },
            },
            featureWhitelist: await this.#get('featureWhitelist', [], (i) => i.split(/\s*,\s*/)),
            emoji: {
                source: await this.#get(['emoji', 'source']),
                privacy: await this.#get(['emoji', 'privacy']),
                invite: await this.#get(['emoji', 'invite']),
                discord: await this.#get(['emoji', 'discord']),
                youtube: await this.#get(['emoji', 'youtube']),
                zendesk: await this.#get(['emoji', 'zendesk']),
                firstPage: await this.#get(['emoji', 'firstPage']),
                previousPage: await this.#get(['emoji', 'previousPage']),
                refresh: await this.#get(['emoji', 'refresh']),
                nextPage: await this.#get(['emoji', 'nextPage']),
                lastPage: await this.#get(['emoji', 'lastPage']),
                announcement: await this.#get(['emoji', 'announcement']),
                channel: await this.#get(['emoji', 'channel']),
                forum: await this.#get(['emoji', 'forum']),
                stage: await this.#get(['emoji', 'stage']),
                thread: await this.#get(['emoji', 'thread']),
                voice: await this.#get(['emoji', 'voice']),
                avatar: await this.#get(['emoji', 'avatar']),
                ban: await this.#get(['emoji', 'ban']),
                moderations: await this.#get(['emoji', 'moderations']),
                mute: await this.#get(['emoji', 'mute']),
                pardon: await this.#get(['emoji', 'pardon']),
                strike: await this.#get(['emoji', 'strike']),
                kick: await this.#get(['emoji', 'kick']),
                userCreated: await this.#get(['emoji', 'userCreated']),
                userId: await this.#get(['emoji', 'userId']),
                userJoined: await this.#get(['emoji', 'userJoined']),
            }
        };
    }

    /**
     * Get a config value from env or config.json
     * @template T
     * @param {string[]|string} keyParts config key parts
     * @param {T} defaultValue default value if key does not exist in the config
     * @param {(env: string) => T} parseEnv function to parse an environment value to the correct type
     * @returns {Promise<T>} the config value
     */
    async #get(keyParts, defaultValue = null, parseEnv = (i) => i) {
        if (typeof keyParts === 'string') {
            keyParts = [keyParts];
        }

        if (this.#shouldUseEnv()) {
            let value = process.env[this.#getEnvKey(keyParts)];
            if (value === undefined) {
                return defaultValue;
            }
            return parseEnv(value);
        }

        let config = await this.#getConfigFile();
        for (let part of keyParts) {
            if (typeof config !== 'object') {
                await logger.error('Invalid config file: ' + keyParts.join('.') + ' is not an object');
                process.exit(1);
            }

            config = config[part];
            if (config === undefined || config === null) {
                return defaultValue;
            }
        }
        return config;
    }

    /**
     * Read and parse the config file if it wasn't read yet.
     * @returns {Promise<object>} config
     */
    async #getConfigFile() {
        if (this.#configFile) {
            return this.#configFile;
        }

        if (!await exists('./config.json')) {
            await logger.error('No settings file found.\n' +
                'Create a config.json or use environment variables as described in the CONFIGURATION.md');
            process.exit(1);
        }

        return this.#configFile ??= await readJSON('./config.json');
    }

    /**
     * Load .env into process.env for local development.
     * Existing environment variables take precedence.
     * @returns {Promise<void>}
     */
    async #loadEnvFile() {
        if (this.#envLoaded || !await exists('./.env')) {
            this.#envLoaded = true;
            return;
        }

        const {readFile} = await import('fs/promises');
        const envFile = (await readFile('./.env', 'utf8')).split(/\r?\n/u);
        for (const line of envFile) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }

            const separator = trimmed.indexOf('=');
            if (separator < 0) {
                continue;
            }

            const key = trimmed.slice(0, separator).trim();
            if (!key || process.env[key] !== undefined) {
                continue;
            }

            let value = trimmed.slice(separator + 1).trim();
            if (
                value.length >= 2 &&
                ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
            ) {
                value = value.slice(1, -1);
            }

            process.env[key] = value;
        }

        this.#envLoaded = true;
    }

    /**
     * Prefer environment variables when explicitly enabled or when an Aegis env-based config is present.
     * @returns {boolean}
     */
    #shouldUseEnv() {
        return !!(
            process.env.AEGIS_USE_ENV ||
            process.env.AEGIS_AUTH_TOKEN ||
            process.env.AEGIS_DATABASE
        );
    }

    /**
     * Convert config key parts to an environment variable key, e.g. ['googleCloud', 'credentials', 'client_email'] -> 'AEGIS_GOOGLE_CLOUD_CREDENTIALS_CLIENT_EMAIL'
     * @param {string[]} keyParts
     * @returns {string}
     */
    #getEnvKey(keyParts) {
        let envKeyParts = ["AEGIS"];

        for (let keyPart of keyParts) {
            let key = "";
            for (let letter of keyPart) {
                if (letter.charCodeAt(0) >= 65 && letter.charCodeAt(0) <= 90 && key) {
                    envKeyParts.push(key);
                    key = "";
                }

                key += letter;
            }
            if (key) {
                envKeyParts.push(key);
            }
        }

        return envKeyParts.join('_').toUpperCase();
    }

    /**
     * Parse an environment variable as a boolean
     * @param {string} string
     * @returns {boolean}
     */
    #parseBooleanFromEnv(string) {
        return ['1', 'true', 'y'].includes(string?.toLowerCase?.());
    }

    /**
     * Parse an environment variable as a base64 encoded json string
     * @template T
     * @param {string} string
     * @returns {T}
     */
    #parseBase64Json(string) {
        return JSON.parse((Buffer.from(string, 'base64')).toString());
    }
}

export default new Config();
