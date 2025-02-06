import JSON5 from 'json5';
import path from 'path';
import {promises as fs} from 'fs';
import { dirname } from 'src/utils/dirname';

const preferencesPath = path.resolve(dirname, "server-preferences.json")
const defaultsPath = path.resolve(dirname, "resources/default-preferences.json")

export interface PreferenceOverrideEntry {
    key: string[]
    value: any
}

export default class Preferences {

    static root: PreferencesSection = null

    static async resetPreferencesFile() {
        return fs.copyFile(defaultsPath, preferencesPath)
    }

    static async read() {
        await fs.access(preferencesPath).catch(async (err) => {
            if(err.code == "ENOENT") {
                await Preferences.resetPreferencesFile()
            } else {
                throw err
            }
        }).then(async () => {
            const data = await fs.readFile(preferencesPath, "utf-8")

            Preferences.root = new PreferencesSection("", JSON5.parse(data))
        })
    }
}

export class PreferencesSection {

    private readonly raw: any
    private readonly path: string;

    constructor(path: string, section: any) {
        this.path = path
        this.raw = section
    }

    override(overrideList: PreferenceOverrideEntry[]) {
        for(let entry of overrideList) {
            this.set(entry.key, entry.value)
        }
    }

    set(path: string[], value: any) {
        let prevDirectory = null
        let lastPathComponent = path[path.length - 1]
        let directory = this.raw

        for(let item of path) {
            if(typeof directory !== "object") {
                return
            }

            prevDirectory = directory
            directory = prevDirectory[item];

            if(directory === undefined || directory === null) {
                directory = {}
                prevDirectory[item] = directory
            }
        }

        prevDirectory[lastPathComponent] = value
    }

    /**
     * Returns preferences value for key
     * @param path
     */
    value(path: string): any {

        let directory = this.raw

        for(let item of path.split(".")) {

            if(typeof directory != "object" || !directory) {
                return undefined
            }

            directory = directory[item];
        }

        return directory
    }

    section(path: string): PreferencesSection {
        let section = this.value(path)
        this.validateSection(section, path)
        return new PreferencesSection(this.nestedPath(path), section)
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not valid port
     */
    port(path: string): number {
        let value = this.value(path)
        this.validatePort(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not a number
     */
    number(path: string): number {
        let value = this.value(path)
        this.validateNumber(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not a boolean
     */
    boolean(path: string): boolean {
        let value = this.value(path)
        this.validateBoolean(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not a string
     */
    string(path: string): string {
        let value = this.value(path)
        this.validateString(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not valid port or null
     */
    portOptional(path: string): number {
        let value = this.value(path)
        if (value === null || value === undefined) return null
        this.validatePort(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not number or null
     */
    numberOptional(path: string): number | null {
        let value = this.value(path)
        if (value === null || value === undefined) return null
        this.validateNumber(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not boolean or null
     */
    booleanOptional(path: string): boolean | null {
        let value = this.value(path)
        if (value === null || value === undefined) return null
        this.validateBoolean(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not string or null
     */
    stringOptional(path: string): string | null {
        let value = this.value(path)
        if (value === null || value === undefined) return null
        this.validateString(value, path)
        return value
    }

    /**
     * Checks if specified value at given path is a valid port
     * @throws if value is not a valid port
     */
    validatePort(value: any, path: string) {
        if(!Number.isInteger(value) || value < 0 || value > 65535 || value !== Math.round(value))
            throw new Error("setting at '" + this.nestedPath(path) + "' should be a valid port (integer in 0...65535 range)")
    }

    /**
     * Checks if specified value at given path is a string
     * @throws if value is not a valid string
     */
    validateString(value: any, path: string) {
        if(typeof value != "string") throw new Error("setting at '" + this.nestedPath(path) + "' should be a string")
    }

    /**
     * Checks if specified value at given path is a number
     * @throws if value is not a number
     */
    validateNumber(value: any, path: string) {
        if(!Number.isInteger(value)) throw new Error("setting at '" + this.nestedPath(path) + "' should be a number")
    }

    /**
     * Checks if specified value at given path is a boolean
     * @throws if value is not a boolean
     */
    validateBoolean(value: any, path: string) {
        if(value !== true && value !== false) throw new Error("setting at '" + this.nestedPath(path) + "' should be a boolean")
    }

    /**
     * Checks if specified value at given path is a nested section
     * @throws if value is not a section
     */
    validateSection(value: any, path: string) {
        if (typeof value !== "object") throw new Error("setting at '" + this.nestedPath(path) + "' should be a section")
    }

    nestedPath(path: string) {
        if(this.path.length == 0) return path
        return this.path + "." + path
    }

    getRaw() {
        return this.raw
    }
}