
const BuilderAction = require("../builder-action")
const Timings = require("../../timings")
const Chalk = require("chalk")
const fs = require("fs")
const Compiler = require("../../compiler/compiler")
const copyDirectory = require("../../utils/copy-directory")
const path = require("path")

class CopyAction extends BuilderAction {
    static validateConfig(config) {

        if(!config.source) {
            throw new Error("'source' field does not exist")
        }

        if (typeof config.source === "object") {
            try {
                this.validateTargetOutputField(config.source)
            } catch(error) {
                throw new Error("'source' field is invalid:\n" + error.message)
            }
        } else if (typeof config.source !== "string") {
            throw new Error("'source' field is not a string or object")
        }

        if(!config.target) {
            throw new Error("'target' field does not exist")
        }

        if(typeof config.target !== "string") {
            throw new Error("'target' field is not a string")
        }
    }

    static getDependencies(config) {
        if(typeof config.source === "object") {
            return [config.source["target-name"]]
        }
        return []
    }

    static getTargets(config, ignoreUnnamed) {
        let targets = {}
        if(config['target-name']) {
            targets[config['target-name']] = [config.target]
        } else if(!ignoreUnnamed) {
            targets['unnamed'] = [config.target]
        }
        return targets
    }

    static async copyFile(source, destination) {
        source = Compiler.path(source)
        destination = Compiler.path(destination)

        let stat = await fs.promises.stat(source)

        let dirname

        if(destination.endsWith("/")) {
            dirname = destination
        } else {
            dirname = path.dirname(destination)
        }

        try {
            await fs.promises.access(dirname)
        } catch {
            await fs.promises.mkdir(dirname, {
                recursive: true
            })
        }

        if(stat.isDirectory()) {
            await copyDirectory.copyDirectory(source, destination)
        } else {
            await fs.promises.copyFile(source, destination)
        }
    }

    static async perform(config, builder, schemeCache, schemeName) {
        let source = config.source
        let sourceLog
        let destinationLog

        if(typeof source == "object") {
            let sourceTargetName = this.getTargetField(source)
            source = builder.targets[sourceTargetName].paths

            sourceLog = Chalk.green(sourceTargetName) + Chalk.blueBright(" (" + source.join(", ") + ")")
        } else {
            sourceLog = Chalk.blueBright(source)
            source = [source]
        }

        let destination = config.target
        let targetName = this.getTargetField(source)

        if(targetName) {
            destinationLog = Chalk.green(targetName) + Chalk.blueBright(" (" + destination + ") ")
        } else {
            destinationLog = Chalk.blueBright(destination)
        }

        Timings.begin("Copying " + sourceLog + " to " + destinationLog)

        await Promise.all(source.map(async file => await this.copyFile(file, destination)))

        Timings.end()
    }

    static getName() {
        return "copy"
    }
}

module.exports = CopyAction