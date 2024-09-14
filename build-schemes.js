
const serverSchemes = require("./build-schemes/server-schemes")
const gameSchemes = require("./build-schemes/game-schemes")
const textureAtlasScheme = require("./build-schemes/texture-atlas-scheme")
const mapConverterSchemes = require("./build-schemes/map-converter-schemes")

module.exports = {
	"schemes": {
		...serverSchemes,
		...gameSchemes,
		...textureAtlasScheme,
		...mapConverterSchemes
	}
}