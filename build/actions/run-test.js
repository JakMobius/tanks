
const Chalk = require("chalk")
const Compiler = require("../compiler/compiler");
const Timings = require("../timings");
const path = require("path")

if(!process.argv[2]) {
    console.log(Chalk.red.bold("Please, specify test path relative to 'test' folder"));
    process.exit(1)
}

async function compile(testName) {

    let testPath = path.join("temp/test", testName.replace('.ts', '.js'))

    async function bundle(options) {
        options = Object.assign({
            cacheFile: "build/cache/browserify-cache.json"
        }, options)

        let compiler = new Compiler(options)

        await compiler.compile()
    }

    Timings.begin("Compiling test '" + testName + "'")

    try {
        await bundle({
            source: path.join("test/", testName),
            destination: testPath
        })
    } catch(error) {
        testPath = null
    }

    Timings.end()

    return testPath
}

(async function perform(testName) {
    Timings.begin("Building")
    let path = await compile(testName)
    Timings.end()

    if(path) {
        console.log("Running test...")
        require(Compiler.path(path))
    } else {
        console.error("Could not run test due to compilation error")
    }
})(process.argv[2])