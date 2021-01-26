
import JSON5 from 'json5';
import path from 'path';
import { promises as fs } from 'fs';

const preferencesPath = path.resolve(__dirname, "server-preferences.json")
const defaultsPath = path.resolve(__dirname, "resources/default-preferences.json")

export interface PreferenceOverrideEntry {
    key: string
    value: any
}

class Preferences {

    static root: any = null

    static async resetPreferences() {
        return fs.copyFile(defaultsPath, preferencesPath)
    }
    static async read() {

        await fs.access(preferencesPath).catch(async (err) => {
            if(err.code = "ENOENT") {
                await Preferences.resetPreferences()
            } else {
                throw err
            }
        }).then(async () => {
            const data = await fs.readFile(preferencesPath, "utf-8")

            Preferences.root = JSON5.parse(data)
        })
    }

    static override(overrideList: PreferenceOverrideEntry[]) {
        for(let entry of overrideList) {
            this.set(entry.key, entry.value)
        }
    }

    static set(path: string, value: any) {
        let prevDirectory = null
        let lastPathComponent = path[path.length - 1]
        let directory = Preferences.root

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
    static value(path: string): any {

        let directory = Preferences.root

        for(let item of path.split(".")) {

            if(typeof directory != "object" || !directory) {
                return undefined
            }

            directory = directory[item];
        }

        return directory
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not valid port
     */
    static port(path: string): number {
        let value = this.value(path)
        this.validatePort(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not a number
     */
    static number(path: string): number {
        let value = this.value(path)
        this.validateNumber(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not a boolean
     */
    static boolean(path: string): boolean {
        let value = this.value(path)
        this.validateBoolean(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not a string
     */
    static string(path: string): string {
        let value = this.value(path)
        this.validateString(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not valid port or null
     */
    static portOptional(path: string): number {
        let value = this.value(path)
        if (value === null || value === undefined) return null
        this.validatePort(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not number or null
     */
    static numberOptional(path: string): number | null {
        let value = this.value(path)
        if (value === null || value === undefined) return null
        this.validateNumber(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not boolean or null
     */
    static booleanOptional(path: string): boolean | null {
        let value = this.value(path)
        if (value === null || value === undefined) return null
        this.validateBoolean(value, path)
        return value
    }

    /**
     * @param path Path to config entry
     * @throws if value at given path is not string or null
     */
    static stringOptional(path: string): string | null {
        let value = this.value(path)
        if (value === null || value === undefined) return null
        this.validateString(value, path)
        return value
    }

    /**
     * Checks if specified value at given path is a valid port
     * @throws if value is not a valid port
     */
    static validatePort(value: any, path: string) {
        if(!Number.isInteger(value) || value < 0 || value > 65535 || value !== Math.round(value))
            throw new Error("setting at " + path + " should be a valid port (integer in 0...65535 range)")
    }

    /**
     * Checks if specified value at given path is a string
     * @throws if value is not a valid string
     */
    static validateString(value: any, path: string) {
        if(typeof value != "string") throw new Error("setting at " + path + " should be string")
    }

    /**
     * Checks if specified value at given path is a number
     * @throws if value is not a number
     */
    static validateNumber(value: any, path: string) {
        if(!Number.isInteger(value)) throw new Error("setting at " + path + " should be number")
    }

    /**
     * Checks if specified value at given path is a boolean
     * @throws if value is not a boolean
     */
    static validateBoolean(value: any, path: string) {
        if(value !== true && value !== false) throw new Error("setting at " + path + " should be boolean")
    }
}

export default Preferences;