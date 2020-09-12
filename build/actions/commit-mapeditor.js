 const {execSync} = require('child_process');
const Compiler = require("../compiler/compiler");
const Timings = require("../timings");
const CSSPlugin = require("../compiler/plugins/css/cssplugin")
const GLSLPlugin = require("../compiler/plugins/glslplugin")
const Collapser = require("../collapser")

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

        cssPlugin.write(Compiler.path("dist/mapeditor/style.css"))
    })
}

(async function perform() {
    Timings.begin("Building")

    if(process.argv.length < 3) {
        console.error("Error: Please, provide dist path")
        return;
    }

    await compile()

    Timings.begin("Collapsing")
    await Collapser.collapse("../../dist/mapeditor/bundle.js")
    Timings.end()

    Timings.begin("Copying files to the dist")

    let dist = process.argv[2]

    let commitPath = path.resolve(dist, "map-editor")
    let assetsPath = path.resolve(dist)

    execSync(`
        rm -rf ${commitPath}/*
        cd ${Compiler.projectDirectory}
        cp -r src/client/copy/* ${assetsPath}
        cp -r dist/mapeditor/* ${commitPath}
        cp src/client/mapeditor/index.html ${commitPath}/index.html
    `.split("\n").join("\n"))

    Timings.end()
    Timings.end()

    console.log("\n\n")
})()
