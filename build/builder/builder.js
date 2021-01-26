
const CopyAction = require("./actions/copy-action")
const CompileJavascriptAction = require("./actions/compile-javascript-action")
const DeleteAction = require("./actions/delete-action")
const BuilderSchemeCache = require("./builder-scheme-cache")
const TextureAtlasProgram = require("./actions/texture-atlas-action")
const Timings = require('../timings')
const Chalk = require('chalk')
const fs = require('fs')

class Builder {
    constructor(config) {
        this.config = config
        this.actions = {}
        this.targets = {}

        this.registerAction(CopyAction)
        this.registerAction(CompileJavascriptAction)
        this.registerAction(DeleteAction)
        this.registerAction(TextureAtlasProgram)

        this.validateConfig()
        this.determineTargets()
    }

    registerAction(action) {
        this.actions[action.getName()] = action
    }

    /*
        Looks awful? I don't like this either. I'll think about
        how to make this look better.
     */

    validateConfig() {
        if(typeof this.config != "object") {
            throw new Error("config should be an object")
        }
        if(!this.config.schemes) {
            throw new Error("config should contain 'schemes' field")
        }
        if(typeof this.config.schemes != "object") {
            throw new Error("config.schemes should be object")
        }
        for(let [name, scheme] of Object.entries(this.config.schemes)) {
            if(typeof scheme != "object") {
                throw new Error("scheme '" + name + "' config is not an object")
            }
            if(!scheme.steps) throw new Error("scheme '" + name + "' does not have 'steps' field")
            if(!Array.isArray(scheme.steps)) throw new Error("'steps' field of scheme '" + name + "' is not an array")
            if(scheme.targets) {
                if(typeof scheme.targets != "object") {
                    throw new Error("'targets' field of scheme '" + name + "' is not an object")
                }
            }
            for(let i = 0; i < scheme.steps.length; i++) {
                let step = scheme.steps[i]
                if(typeof step != "object") {
                    throw new Error((i + 1) + " step of scheme '" + name + "' is not an object")
                }
                if(!step.action) {
                    throw new Error((i + 1) + " step of scheme '" + name + "' does not have 'action' field")
                }
                if(typeof step.action != "string") {
                    throw new Error("'action' field of " + (i + 1) + " step of scheme '" + name + "' is not a string")
                }
                if(!this.actions[step.action]) {
                    throw new Error("'action' field of " + (i + 1) + " step of scheme '" + name + "' is invalid beacause '" + step.action + "' action name is unknown")
                }
                let action = this.actions[step.action]
                try {
                    action.validateConfig(step)
                } catch(error) {
                    throw new Error((i + 1) + " step of scheme '" + name + "' is invalid:\n" + error.message)
                }
            }
        }
    }

    determineTargets() {
        for(let [name, scheme] of Object.entries(this.config.schemes)) {
            let targets = this.analyzeSchemeTargets(scheme)

            for(let [target, paths] of Object.entries(targets)) {
                if(this.targets[target]) {
                    throw new Error("Redefinition of target '" + target + "'")
                }

                this.targets[target] = {
                    paths: paths,
                    scheme: name
                }
            }
        }
    }

    async buildScheme(schemeName) {
        let queue = []

        this.enqueueSchemeBuild(schemeName, queue)

        queue = queue.reverse()

        for(let schemeName of queue) {
            Timings.begin("Running scheme '" + Chalk.magenta(schemeName) + "'")
            let scheme = this.config.schemes[schemeName]
            let schemeCache = new BuilderSchemeCache()

            for(let step of scheme.steps) {
                await this.actions[step.action].perform(step, this, schemeCache, schemeName)
            }

            await schemeCache.destroy()
            Timings.end("Finished running scheme '" + Chalk.magenta(schemeName) + "'")
        }
    }

    enqueueSchemeBuild(schemeName, queue) {
        let index = queue.indexOf(schemeName)
        if(index != -1) {
            throw new Error("Circular dependency: " + queue.slice(index).join(" -> ") + " -> " + schemeName)
        }
        queue.push(schemeName)

        let scheme = this.config.schemes[schemeName]

        if(!scheme) {
            throw new Error("No such scheme: " + schemeName)
        }

        let dependencies = this.analyzeSchemeDependencies(scheme)

        for(let dependency of dependencies) {
            let target = this.targets[dependency]
            if(!target) {
                throw new Error("Target '" + dependency + "' is undefined")
            }

            this.enqueueSchemeBuild(target.scheme, queue)
        }
    }

    analyzeSchemeTargets(scheme) {
        let targets = {}

        for(let step of scheme.steps) {
            let action = this.actions[step.action]
            let stepTargets = action.getTargets(step, true)
            if(stepTargets)
                Object.assign(targets, stepTargets)
        }

        if(scheme.targets) {
            for(let [key, value] of Object.entries(scheme.targets)) {
                if(Array.isArray(value)) {
                    if(targets[key]) {
                        targets[key] = targets[key].concat(value)
                    } else {
                        targets[key] = value
                    }
                } else if(targets[key]) {
                    targets[key].push(value)
                } else {
                    targets[key] = [value]
                }
            }
        }

        return targets
    }

    analyzeSchemeDependencies(scheme) {
        if(!scheme.steps) {
            return []
        }
        let result = []

        for(let step of scheme.steps) {
            let stepDependencies = this.analyzeStepDependencies(step)

            if(stepDependencies && stepDependencies.length) {
                result = result.concat(stepDependencies)
            }
        }

        return result
    }

    analyzeStepDependencies(step) {
        if(step.action === "copy") {
            if(typeof step.source == "object" && step.source["target-name"]) {
                return [step.source["target-name"]]
            }
        }
        return null
    }
}

module.exports = Builder