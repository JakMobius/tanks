
const BuilderAction = require("../builder-action")
const Timings = require("../../timings")
const Compiler = require("../../compiler/compiler")
const CompileCache = require("../../compilecache")
const Chalk = require("chalk")

class CompileJavascriptAction extends BuilderAction {
    static validateConfig(config) {
        if(!config.source) throw new Error("'source' field does not exist")
        if(!config.target) throw new Error("'target' field does not exist")

        if (typeof config.source === "object") {
            try {
                this.validateTargetOutputField(config.source)
            } catch(error) {
                throw new Error("'source' field is invalid:\n" + error.message)
            }
        } else if (typeof config.source !== "string") {
            throw new Error("'source' field is not a string or object")
        }

        if(typeof config.target !== "string") throw new Error("'target' field is not a string")
        if(config.plugins && typeof config.plugins !== "object") throw new Error("'plugins' field should be an object")
    }

    static getDependencies(config) {
        if(typeof config.source === "object") {
            return [this.getTargetField(config.source)]
        }
        return []
    }

    static willGenerateSourceMaps(config) {
        return true
    }

    static getTargets(config, ignoreUnnamed) {
        if(ignoreUnnamed && !config['target-name']) return {}
        let targets = {}
        let targetName = config['target-name'] || 'unnamed'

        if(this.willGenerateSourceMaps(config)) {
            targets[targetName] = [config.target, config.target + ".map"]
        } else {
            targets[targetName] = [config.target]
        }

        return targets
    }

    static createPlugin(pluginName, config) {
        let Plugin
        try {
            Plugin = require("../../compiler/plugins/" + pluginName)
        } catch(error) {
            throw new Error("No such plugin: '" + pluginName + "'")
        }
        return new Plugin(config)
    }

    static async perform(config, builder, schemeCache, schemeName) {

        if(!schemeCache.cache.unitedPlugins) {
            schemeCache.cache.unitedPlugins = {}
        }

        let source = config.source
        if(typeof source == "object") {
            source = builder.targets[this.getTargetField(source)].path
        }
        let destination = config.target
        let plugins = config.plugins

        let logFileName

        if(config["target-name"]) {
            logFileName = Chalk.green(config["target-name"])
        } else {
            logFileName = Chalk.blueBright(source)
        }

        if(!schemeCache.cache.saved) {
            schemeCache.cache.shouldRebuild = false

            let cache = await CompileCache.readCache("javascript-builder")
            if (!cache.schemes) cache.schemes = {}

            if(!cache.schemes[schemeName]) {
                schemeCache.cache.shouldRebuild = true
                cache.schemes[schemeName] = {}
            }

            let savedSchemeCache = cache.schemes[schemeName]

            schemeCache.cache.saved = savedSchemeCache


            if (savedSchemeCache.schemeFiles) {
                let promises = Object.keys(savedSchemeCache.schemeFiles).map(async (file) => {
                    if(await CompileCache.shouldUpdate(file, savedSchemeCache.schemeFiles)) {
                        schemeCache.cache.shouldRebuild = true
                    }
                })

                await Promise.all(promises)
            }

            if(schemeCache.cache.shouldRebuild) {
                schemeCache.cache.schemeFileList = []
                schemeCache.on("destroy", async () => {
                    savedSchemeCache.schemeFiles = {}
                    for(let file of schemeCache.cache.schemeFileList) {
                        CompileCache.updateFile(file, savedSchemeCache.schemeFiles)
                    }
                    CompileCache.writeCache("javascript-builder", cache)
                })
            }
        }

        if(schemeCache.cache.shouldRebuild) {
            
            Timings.begin("Building " + logFileName)

            let compilerOptions = {
                source: source,
                destination: destination,
                cacheFile: "build/cache/browserify-cache.json"
            }

            if (config["compiler-options"]) {
                Object.assign(compilerOptions, config["compiler-options"])
            }

            let compiler = new Compiler(compilerOptions)
            let localPlugins = []

            if (plugins) {
                for (let [pluginName, config] of Object.entries(plugins)) {

                    let plugin

                    if (typeof config === "string") {
                        let sharedConfigs = builder.config.schemes[schemeName].configs
                        let sharedConfig = sharedConfigs && sharedConfigs[config]
                        if (!sharedConfigs && !sharedConfig) {
                            throw new Error("Config '" + config + "' is referenced but not present in scheme configuration")
                        }
                        if (!sharedConfig.enabled) continue
                        if (sharedConfig["unite-different-targets"]) {
                            plugin = schemeCache.cache.unitedPlugins[config]

                            if (!plugin) {
                                plugin = this.createPlugin(pluginName, sharedConfig)
                                schemeCache.cache.unitedPlugins[config] = plugin

                                schemeCache.on("destroy", async () => {
                                    await plugin.finish()
                                })
                            }
                        } else {
                            plugin = this.createPlugin(pluginName, sharedConfig)
                            localPlugins.push(plugin)
                        }
                    } else {
                        if (!config.enabled) continue
                        plugin = this.createPlugin(pluginName, config)
                        localPlugins.push(plugin)
                    }

                    compiler.plugin(plugin)
                }
            }

            await compiler.compile()

            for (let plugin of localPlugins) {
                await plugin.finish()
            }

            schemeCache.cache.schemeFileList = schemeCache.cache.schemeFileList.concat(compiler.projectFiles)
            Timings.end("Finished building " + logFileName)
        } else {
            Timings.begin("Skipping " + logFileName)
            Timings.end()
        }
    }

    static getName() {
        return "compile-javascript"
    }
}

module.exports = CompileJavascriptAction