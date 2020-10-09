const {execSync} = require('child_process');
const Compiler = require("../compiler/compiler");
const Timings = require("../timings");
const CSSPlugin = require("../compiler/plugins/css/cssplugin")
const GLSLPlugin = require("../compiler/plugins/glslplugin")
const Collapser = require("../collapser")
const path = require("path")
const fs = require("fs").promises
const copyDirectory = require("../../src/utils/fs/copy-directory")
const insertDirectory = require("../../src/utils/fs/insert-directory")

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
                source: "src/client/mapeditor/index.js",
                destination: "dist/mapeditor/index.js"
            })
        })

        await Timings.perform("Compiling editor", async () => {
            await bundle({
                source: "src/client/mapeditor/editor.js",
                destination: "dist/mapeditor/editor.js"
            })
        })

        await cssPlugin.write(Compiler.path("dist/mapeditor/style.css"))
    })
}

(async function perform() {
    if(process.argv.length < 3) {
        console.error("Error: Please, provide dist path")
        return;
    }

    Timings.begin("Building")

    Timings.begin("Compiling map editor")
    await compile()
    Timings.end()

    Timings.begin("Collapsing")
    await Collapser.collapse("../../dist/mapeditor/editor.js")
    Timings.end()

    Timings.begin("Copying files to the dist")

    let dist = Compiler.path(process.argv[2])

    let commitPath = path.resolve(dist, "map-editor")
    let assetsPath = dist

    await fs.rmdir(commitPath, { recursive: true })
    await fs.mkdir(commitPath)

    await insertDirectory(Compiler.path("src/client/copy"), assetsPath)
    await insertDirectory(Compiler.path("dist/mapeditor"), commitPath)
    await fs.copyFile(Compiler.path("src/client/mapeditor/index.html"), path.resolve(commitPath, "index.html"))

    Timings.end()
    Timings.end()

    console.log("\n\n")
})()
