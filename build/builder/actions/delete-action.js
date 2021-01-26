
const BuilderAction = require("../builder-action")
const Timings = require("../../timings")
const Chalk = require("chalk")
const fs = require("fs")
const Compiler = require("../../compiler/compiler")

class DeleteAction extends BuilderAction {
    static validateConfig(config) {

        if(!config.target) {
            throw new Error("'target' field does not exist")
        }

        if (typeof config.target === "object") {
            try {
                this.validateTargetOutputField(config.target)
            } catch(error) {
                throw new Error("'target' field is invalid:\n" + error.message)
            }
        } else if (typeof config.target !== "string") {
            throw new Error("'target' field is not a string or object")
        }
    }

    static getDependencies(config) {
        if(typeof config.target === "object") {
            return [config.target["target-name"]]
        }
        return []
    }

    static getTargets(config, ignoreUnnamed) {
        return {}
    }

    static async deleteFile(file) {
        file = Compiler.path(file)

        try {
            let stat = await fs.promises.stat(file)

            if (stat.isDirectory()) {
                await fs.promises.rmdir(file, { recursive: true })
            } else {
                await fs.promises.rm(file)
            }
        } catch(ignored) {}
    }

    static async perform(config, builder, schemeCache, schemeName) {
        let destinationLog
        let destination = config.target
        let files

        if (typeof destination === "string") {
            files = [destination]
            destinationLog = Chalk.blueBright(destination)
        } else {
            let targetName = this.getTargetField(destination)
            files = builder.targets[targetName].paths
            destinationLog = Chalk.green(targetName) + Chalk.blueBright(" (" + files.join(", ") + ") ")
        }

        Timings.begin("Deleting " + destinationLog)

        await Promise.all(files.map(async file => await this.deleteFile(file, destination)))

        Timings.end()
    }

    static getName() {
        return "delete"
    }
}

module.exports = DeleteAction