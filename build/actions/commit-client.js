
const {execSync} = require('child_process');
const Compiler = require("../compiler/compiler");
const Collapser = require("../collapser");
const Timings = require("../timings");
const CSSPlugin = require("../compiler/plugins/css/cssplugin");
const GLSLPlugin = require("../compiler/plugins/glslplugin");

async function compile() {
    let cssPlugin = new CSSPlugin()

    async function bundle(options) {
        options = Object.assign({
            cacheFile: "build/cache/browserify-cache.json"
        }, options)

        let compiler = new Compiler(options)
        compiler.plugin(cssPlugin)
        compiler.plugin(new GLSLPlugin({
            placeholder: "shader-loader-placeholder"
        }))

        await compiler.compile()
    }

    await Timings.perform("Compiling", async () => {
        await Timings.perform("Compiling base", async () => {
            await bundle({
                source: "src/client/game/index.js",
                destination: "dist/game/index.js"
            })
        })

        await Timings.perform("Compiling game", async () => {
            await bundle({
                source: "src/client/game/game.js",
                destination: "dist/game/game.js"
            })
        })

        cssPlugin.write(Compiler.path("dist/game/styles.css"))
    })
}

(async function perform() {
    Timings.begin("Building")
    await compile()

    Timings.begin("Collapsing")
    await Collapser.collapse("../../dist/game/index.js")
    await Collapser.collapse("../../dist/game/game.js")
    Timings.end()

    Timings.begin("Copying files to the dist")

    let commitPath = "/Library/WebServer/Documents/new-tanks-online/game"
    let assetsPath = "/Library/WebServer/Documents/new-tanks-online/"

    execSync(`
        rm -rf ${commitPath}/*
        cd ${Compiler.projectDirectory}
        cp -r src/client/copy/* ${assetsPath}
        cp -r dist/game/* ${commitPath}
        cp src/client/game/index.html ${commitPath}/index.html
    `.split("\n").join("\n"))

    Timings.end()
    Timings.end()

    console.log("\n\n")
})()
