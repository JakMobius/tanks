
const Compiler = require("../compiler/compiler");
const Collapser = require("../collapser");
const Timings = require("../timings");
const CSSPlugin = require("../compiler/plugins/css/cssplugin");

async function compile() {
    let cssPlugin = new CSSPlugin()

    async function bundle(options) {
        options = Object.assign({
            cacheFile: "build/cache/browserify-cache.json"
        }, options)

        let compiler = new Compiler(options)
        compiler.plugin(cssPlugin)

        await compiler.compile()
    }

    await Timings.perform("Compiling", async () => {
        await Timings.perform("Compiling hub", async () => {
            await bundle({
                source: "src/client/hub/index.js",
                destination: "src/client/hub/page/scripts/index.js"
            })
        })

        await cssPlugin.write(Compiler.path("src/client/hub/page/styles/style.css"))
    })
}

(async function perform() {

    Timings.begin("Building")
    await compile()

    Timings.begin("Collapsing")
    await Collapser.collapse(Compiler.path("src/client/hub/page/scripts/index.js"))
    Timings.end()
    Timings.end()
})()
