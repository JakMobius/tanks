import { createFilter } from '@rollup/pluginutils'
import path from "path"
import Canvas from "canvas"
import fs from "fs"
import atlaspack from "atlaspack"

export class AtlasCreationSession {
  canvas = null
  ctx = null
  atlas = null
  atlasDescriptor = {}
  atlasSize
  texturesToPack

  constructor(atlasSize) {
    this.atlasSize = atlasSize
  }

  static webglRect(rect, canvas) {
    return {
      x: (rect.x + 1) / canvas.width,
      y: (rect.y + 1) / canvas.height,
      w: (rect.w - 2) / canvas.width,
      h: (rect.h - 2) / canvas.height
    }
  }

  createCanvas() {
    let size = this.atlasSize
    this.canvas = Canvas.createCanvas(size, size);
    this.ctx = this.canvas.getContext('2d');
    this.atlas = atlaspack(this.canvas);
  }

  drawTextures() {
    for (let image of this.texturesToPack) {

      const rect = this.atlas.pack({
        width: image.image.width + 2,
        height: image.image.height + 2
      }).rect;

      if (!rect) {
        return false
      }

      let texturePath = image.name

      this.atlasDescriptor[texturePath] = AtlasCreationSession.webglRect(rect, this.canvas)

      AtlasCreationSession.drawTexture(this.canvas, this.ctx, image, rect)
    }
    return true
  }

  async setTextures(textures) {
    this.texturesToPack = textures.toSorted((left, right) => {
      return right.image.width * right.image.height - left.image.width * left.image.height
    })
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
}

function dirname(path) {
	const match = /[/\\][^/\\]*$/.exec(path);
	if (!match) return '.';

	const directory = path.slice(0, -match[0].length);

	// If `directory` is the empty string, we're at root.
	return directory || '/';
}

function sameSets(a, b) {
  for (let element of a) {
    if (!b.has(element)) return false
  }

  for (let element of b) {
    if (!a.has(element)) return false
  }

  return true
}

function deepCompare(x, y) {
  if (x === y) return true;

  if (!(x instanceof Object) || !(y instanceof Object)) return false;

  if (x.constructor !== y.constructor) return false;

  for (var p in x) {
    if (!x.hasOwnProperty(p)) continue;
    if (!y.hasOwnProperty(p)) return false;

    if (x[p] === y[p]) continue;

    if (typeof (x[p]) !== "object") return false;
    if (!deepCompare(x[p], y[p])) return false;
  }

  for (p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
      return false;
    }
  }

  return true;
}

function getAtlasSettings(pluginOptions) {
  return {
    atlasSize: pluginOptions.atlasSize
  }
}

class RollupPluginTextureAtlas {
  pluginOptions = null
  atlasPngPath = null
  atlasJsonPath = null
  filter = null
  texturePaths = new Set()
  idTransformer = null

  constructor(config) {
    this.pluginOptions = Object.assign({
      include: ["**/*.texture.png"],
      output: "atlases",
      atlasSize: 2048
    }, config)

    this.idTransformer = config.idTransformer

    this.atlasPngPath = path.join(this.pluginOptions.output, "atlas.png")
    this.atlasJsonPath = path.join(this.pluginOptions.output, "atlas.json")

    this.filter = createFilter(this.pluginOptions.include)
  }

  getBundleRoot(outputOptions) {
    // As guessed from rollup source code:
    // https://github.com/rollup/rollup/blob/615efa045779fae70c4fd5fe64fdb08a039c0442/src/rollup/rollup.ts#L299

    // Yup, it can break at any time, but I really don't want to rebuild the texture atlas
    // every time. 

    return outputOptions.dir || dirname(outputOptions.file)
  }

  buildStart(plugin) {
    this.texturePaths.clear()
  }

  resolveId(plugin, source, importer) {
    if (!this.filter(source)) return

    return source
  }

  load(plugin, id) {
    if (!this.filter(id)) return

    let relativePath = path.relative(process.cwd(), id);
    this.texturePaths.add(relativePath)

    if(this.idTransformer) {
      relativePath = this.idTransformer(relativePath)
    }

    return `export default ${JSON.stringify(relativePath)};`
  }

  async readTextures() {
    let result = []

    await Promise.all(Array.from(this.texturePaths).map(file => new Promise((resolve, reject) => {
      const image = new Canvas.Image();

      image.onload = () => {
        if(this.idTransformer) {
          file = this.idTransformer(file)
        }

        result.push({
          name: file,
          image: image
        })
        resolve()
      }

      // node-canvas sometimes throws ENOENT without
      // any reason on Windows, so we help him by
      // reading the file for him.
      const buffer = fs.readFileSync(file)

      image.onerror = reject
      image.src = buffer
    })))

    return result
  }

  async generateBundle(plugin, outputOptions, bundle, isWrite) {
    if (!isWrite) return

    let atlasPng = null
    let atlasJson = null

    if (this.isAtlasRecent(outputOptions)) {
      let bundleRoot = this.getBundleRoot(outputOptions)
      atlasPng = fs.readFileSync(path.join(bundleRoot, this.atlasPngPath))
      atlasJson = fs.readFileSync(path.join(bundleRoot, this.atlasJsonPath))
    } else {
      plugin.warn("Updating the texture atlas")
      let context = new AtlasCreationSession(this.pluginOptions.atlasSize ?? 1024)

      context.setTextures(await this.readTextures())

      context.createCanvas()
      if (!context.drawTextures()) {
        plugin.warn("Could not fit all the textures in the texture atlas.")
      }

      atlasPng = context.canvas.toBuffer()
      atlasJson = JSON.stringify({
        settings: getAtlasSettings(this.pluginOptions),
        textures: context.atlasDescriptor
      })
    }

    plugin.emitFile({
      type: "asset",
      fileName: this.atlasPngPath,
      source: atlasPng
    })

    plugin.emitFile({
      type: "asset",
      fileName: this.atlasJsonPath,
      source: atlasJson
    })
  }

  transformTextures(set, transformer) {
    let result = new Set()
    for(let texture of set) {
      result.add(transformer(texture))
    }
    return result
  }

  isAtlasRecent(outputOptions) {
    try {
      let bundleRoot = this.getBundleRoot(outputOptions)
      let fullJsonPath = path.join(bundleRoot, this.atlasJsonPath)
      let existingJson = JSON.parse(fs.readFileSync(fullJsonPath, 'utf-8'))
      let jsonTextures = new Set(Object.keys(existingJson.textures))

      let transformedTextues = this.texturePaths
      if(this.idTransformer) {
        transformedTextues = this.transformTextures(this.texturePaths, this.idTransformer)
      }

      if (!sameSets(transformedTextues, jsonTextures)) {
        return false
      }

      if (!deepCompare(existingJson.settings, getAtlasSettings(this.pluginOptions))) {
        return false;
      }

      let existingJsonStat = fs.statSync(fullJsonPath)

      for (let texture of this.texturePaths) {
        let textureStat = fs.statSync(texture)

        if (textureStat.mtime > existingJsonStat.mtime) {
          return false
        }
      }

      return true
    } catch (e) {
      if (e instanceof Error && e.code == "ENOENT") {
        return false
      }
      throw e
    }
  }

  interface() {
    let self = this
    return {
      name: "rollup-plugin-texture-atlas",
      buildStart: function(...args) { return self.buildStart(this, ...args) },
      resolveId: function(...args) { return self.resolveId(this, ...args) },
      load: function(...args) { return self.load(this, ...args) },
      generateBundle: function(...args) { return self.generateBundle(this, ...args) },
    }
  }
}

export default function rollupPluginTextureAtlas(config) {
  return new RollupPluginTextureAtlas(config).interface()
}