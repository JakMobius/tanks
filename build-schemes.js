
const serverSchemes = require("./build-schemes/server-schemes")
const hubSchemes = require("./build-schemes/hub-schemes")
const gameSchemes = require("./build-schemes/game-schemes")
const tutorialSchemes = require("./build-schemes/tutorial-schemes")
const mapEditorSchemes = require("./build-schemes/map-editor-schemes")
const textureAtlasScheme = require("./build-schemes/texture-atlas-scheme")

module.exports = {
	"schemes": {
		...serverSchemes,
		...hubSchemes,
		...gameSchemes,
		...tutorialSchemes,
		...mapEditorSchemes,
		...textureAtlasScheme
	}
}