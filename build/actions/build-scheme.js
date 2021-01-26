

const Chalk = require("chalk")
const path = require("path")
const Builder = require("../builder/builder")
const Timings = require('../timings')

if(!process.argv[2]) {
    console.log(Chalk.red.bold("Please, specify scheme to build"));
    process.exit(1)
}

const schemeName = process.argv[2]

Timings.perform("Building", async () => {
    try {
        const buildConfig = require("../build-schemes.json")
        let builder = new Builder(buildConfig)
        await builder.buildScheme(schemeName)
    } catch(error) {
        console.error(error)
    }
})
