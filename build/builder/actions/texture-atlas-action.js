
const BuilderAction = require("../builder-action")
const Timings = require("../../timings")
const Compiler = require("../../compiler/compiler")
const CompileCache = require("../../compilecache")
const Canvas = require("canvas")
const atlaspack = require("atlaspack")
const Chalk = require("chalk")
const fs = require('fs')
const path = require('path')
const readdirDeep = require("../../utils/read-dir-deep")

class TextureAtlasAction extends BuilderAction {
    static validateConfig(config) {
        if(!config.source) throw new Error("'source' field does not exist")
        if(!config.target) throw new Error("'target' field does not exist")
        if(!config.atlasSize) throw new Error("'atlasSize' field does not exist")

        if(typeof config.source !== "string") throw new Error("'source' field is not string")
        if(typeof config.target !== "string") throw new Error("'target' field is not a string")
        if(typeof config.atlasSize != "number") throw new Error("'atlasSize' field is not a number")

        let size = config.atlasSize
        if((size & (size - 1)) !== 0) throw new Error("'atlasSize' is not power of two")
    }

    static getDependencies(config) {
        if(typeof config.source === "object") {
            return [this.getTargetField(config.source)]
        }
        return []
    }

    static getTargets(config, ignoreUnnamed) {
        if(ignoreUnnamed && !config['target-name']) return {}
        let targets = {}
        let targetName = config['target-name'] || 'unnamed'

        targets[targetName] = [config.target]

        return targets
    }

    static createCanvases(canvases, contexts, atlases, size) {
        do {
            let canvas = Canvas.createCanvas(size, size);
            let ctx = canvas.getContext('2d');
            let atlas = atlaspack(canvas);

            atlas.tilepad = true

            canvases.push(canvas)
            contexts.push(ctx)
            atlases.push(atlas)

            size >>= 1
        } while(size > 64)
    }

    static fileName(file) {
        const fragments = file.split(".");

        if(fragments.length > 1) fragments.pop()

        return fragments.join(".")
    }

    static compareArrays(a, b) {
        if(a.length != b.length) return false
        for(let i = 0; i < a.length; i++) {
            if(a[i] != b[i]) return false
        }
        return true
    }

    static drawTexture(canvas, ctx, img, rect) {
        // Internal
        ctx.drawImage(img.image, rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2)

        // Left
        ctx.drawImage(canvas, rect.x + 1, rect.y + 1, 1, rect.h - 2, rect.x, rect.y + 1, 1, rect.h - 2)
        // Right
        ctx.drawImage(canvas, rect.x + rect.w - 2, rect.y + 1, 1, rect.h - 2, rect.x + rect.w - 1, rect.y + 1, 1, rect.h - 2)
        // Top
        ctx.drawImage(canvas, rect.x + 1, rect.y + 1, rect.w - 2, 1, rect.x + 1, rect.y, rect.w - 2, 1)
        // Bottom
        ctx.drawImage(canvas, rect.x + 1, rect.y + rect.h - 2, rect.w - 2, 1, rect.x + 1, rect.y + rect.h - 1, rect.w - 2, 1)

        // Left-top
        ctx.drawImage(canvas, rect.x + 1, rect.y + 1, 1, 1, rect.x, rect.y, 1, 1)
        // Right-top
        ctx.drawImage(canvas, rect.x + rect.w - 2, rect.y + 1, 1, 1, rect.x + rect.w - 1, rect.y, 1, 1)
        // Left-bottom
        ctx.drawImage(canvas, rect.x + 1, rect.y + rect.h - 2, 1, 1, rect.x, rect.y + rect.h - 1, 1, 1)
        // Right-bottom
        ctx.drawImage(canvas, rect.x + rect.w - 2, rect.y + rect.h - 2, 1, 1, rect.x + rect.w - 1, rect.y + rect.h - 1, 1, 1)
    }

    static async shouldRefreshDirectory(directory, list) {
        let cache = await CompileCache.readCache("texture-atlas")
        if(!cache.directories) cache.directories = {}

        if(cache.directories[directory]) {
            if(this.compareArrays(cache.directories[directory], list)) {
                Timings.end()
                return false
            }
        }

        cache.directories[directory] = list

        await CompileCache.writeCache("texture-atlas", cache)

        return true
    }

    static async readImages(fileList, base) {
        let images = []
        await Promise.all(fileList.map(file => new Promise((resolve, reject) => {
            const image = new Canvas.Image();

            image.onload = () => {
                images.push({
                    name: this.fileName(file),
                    image: image
                })
                resolve()
            }

            image.onerror = reject
            image.src = path.resolve(base, file)
        })))
        return images
    }

    static imageSizeComparator(img1, img2) {
        return img2.image.width * img2.image.height - img1.image.width * img1.image.height
    }

    static writeAtlases(canvases, atlasDescriptors, destination) {
        for(let j = 0; j < canvases.length; j++) {
            if(!canvases[j]) break

            fs.writeFileSync(path.resolve(destination, "atlas-mipmap-level-" + j + ".png"), canvases[j].toBuffer());
            fs.writeFileSync(path.resolve(destination, "atlas-mipmap-level-" + j + ".json"), JSON.stringify(atlasDescriptors[j]));
        }
    }

    static webglRect(rect, canvas) {
        return {
            x: (rect.x + 1) / canvas.width,
            y: (rect.y + 1) / canvas.height,
            w: (rect.w - 2) / canvas.width,
            h: (rect.h - 2) / canvas.height
        }
    }

    static async perform(config, builder, schemeCache, schemeName) {

        Timings.begin("Creating texture atlases of " + Chalk.blueBright(config.source))

        let canvases = [];
        let contexts = [];
        let atlases = [];
        let atlasDescriptors = [];

        Timings.begin("Reading directory")
        let list = (await readdirDeep(config.source)).filter(file => file.endsWith(".png"))
        Timings.end()

        if(!await this.shouldRefreshDirectory(config.source, list)) return

        Timings.begin("Allocating image buffers")
        this.createCanvases(canvases, contexts, atlases, config.atlasSize)
        Timings.end()

        Timings.begin("Reading images")
        let images = (await this.readImages(list, config.source)).sort(this.imageSizeComparator)
        Timings.end()

        Timings.begin("Drawing atlases")

        for(let image of images) {
            let mipMapSize = config.atlasSize
            let scale = 1

            for(let j = 0; canvases[j]; j++) {
                const rect = atlases[j].pack({
                    width: image.image.width * scale + 2,
                    height: image.image.height * scale + 2
                }).rect;

                if(!rect) {
                    canvases[j] = null
                    break
                }

                if(!atlasDescriptors[j]) atlasDescriptors[j] = {}
                atlasDescriptors[j][image.name] = this.webglRect(rect, canvases[j])

                this.drawTexture(canvases[j], contexts[j], image, rect)

                mipMapSize >>= 1
                scale /= 2
            }
        }

        Timings.end()

        Timings.begin("Writing mipmaps to " + Chalk.blueBright(config.target))
        await this.writeAtlases(canvases, atlasDescriptors, config.target)
        Timings.end()
    }

    static getName() {
        return "texture-atlas"
    }
}

module.exports = TextureAtlasAction