import Command, {CommandConfig} from './command';
import CommandFlag from './command-flag';

export interface ConfigOverride {
    key: string[]
    value: any
}

export interface ConfigOverrideList {
    overrides: ConfigOverride[]
    errors: string[]
}

export default class BootCommand extends Command {
	public preferencesOverride: ConfigOverrideList;
	public parsedFlags: Map<string, boolean | string[]>;

    constructor(options: CommandConfig) {
        super(options);

        this.preferencesOverride = null

        this.addFlag(new CommandFlag({
            type: "key",
            name: "script",
            aliases: ["s"],
            description: "Run script(-s) after server start"
        }))

        this.addFlag(new CommandFlag({
            type: "key",
            name: "preference-string",
            aliases: ["ps"],
            description: "Override preferences with string. Usage: -ps path.to.key=\"value\""
        }))

        this.addFlag(new CommandFlag({
            type: "key",
            name: "preference-number",
            aliases: ["pn"],
            description: "Override preferences with a number. Usage: -pn path.to.key=value"
        }))

        this.addFlag(new CommandFlag({
            type: "key",
            name: "preference-boolean",
            aliases: ["pb"],
            description: "Override preferences with a boolean. Usage: -pn path.to.key=true|false"
        }))

        this.parsedFlags = null
    }

    private static parsePreferencesFlag(flag: string): ConfigOverride | null {
        let parts = flag.split("=")
        if(parts.length !== 2) return null

        let key = parts[0].split(".")
        let value = parts[1]

        return {
            key: key,
            value: value
        }
    }

    private static parsePreferencesOverrides(parsedFlags: Map<string, string[] | boolean>) : ConfigOverrideList {
        let stringOverride = parsedFlags.get("preference-string") as string[]
        let numberOverride = parsedFlags.get("preference-number") as string[]
        let booleanOverride = parsedFlags.get("preference-boolean") as string[]
        let errors = []
        let overrides = []

        if(stringOverride) {
            for(let override of stringOverride) {
                let flag = BootCommand.parsePreferencesFlag(override)
                if (flag)  overrides.push(flag)
                else errors.push(`Invalid preference flag syntax: ${flag}`)
            }
        }

        if(numberOverride) {
            for(let override of numberOverride) {
                let flag = BootCommand.parsePreferencesFlag(override)
                if (flag) {
                    if (Number.isNaN(parseFloat(flag.value))) errors.push(`Invalid number for preference flag: "${flag.value}"`)
                    else {
                        flag.value = Number(flag.value)
                        overrides.push(flag)
                    }
                } else errors.push(`Invalid preference flag syntax: ${flag}`)
            }
        }

        if(booleanOverride) {
            for(let override of booleanOverride) {
                let flag = BootCommand.parsePreferencesFlag(override)
                if(flag) {
                    flag.value = flag.value.toLowerCase()
                    if(flag.value === "true") flag.value = true
                    else if(flag.value === "false") flag.value = false
                    else if(flag.value === "1") flag.value = true
                    else if(flag.value === "0") flag.value = false
                    else if(flag.value === "yes") flag.value = true
                    else if(flag.value === "no") flag.value = false
                    else {
                        errors.push(`"${flag.value}" is not a valid boolean`)
                        continue
                    }

                    overrides.push(flag)
                } else errors.push(`Invalid preference flag syntax: ${flag}`)
            }
        }

        return {
            errors: errors,
            overrides: overrides
        }
    }

    onPerform(args: string[]) {
        let flags = this.findFlags(args.slice(2))
        if (flags.errors) {
            return
        }

        this.parsedFlags = flags.flags

        let preferencesOverrideResult = BootCommand.parsePreferencesOverrides(this.parsedFlags)

        if(preferencesOverrideResult.errors.length) {
            for(let error of preferencesOverrideResult.errors) {
                console.log(error)
            }
        }

        this.preferencesOverride = preferencesOverrideResult

    }

    public runPostInit() {
        let scripts = this.parsedFlags.get("script")
        
        if(!Array.isArray(scripts)) {
            console.log("Invalid value for script flag")
            return
        }

        for(let script of scripts) {
            this.console.runScript(script)
        }
    }

    getName() {
        return "Server boot command";
    }
}