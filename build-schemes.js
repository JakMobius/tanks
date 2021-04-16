
/*
  TODO: includeExternalModules may not change
   within schemes cached together for
   Beelder v0.0.8, so things can go terribly
   wrong here.
*/

// Possible workarounds:
// - Make different caches for server and client
//  This may be better approach, because with
//  separated caches it's possible to build
//  client and server independently with different
//  Babel options, which might be handful.
//  However, this would make first build much slower
// - Modify Beelder to allow includeExternalModules
//  to change. It's faster, but looks like a temporary
//  solution, since this will make the assembly process
//  less flexible.

const bundlerBabelPlugins = [
	["module-resolver", { "extensions": [".js", ".ts", ".json"], "alias": { "src": "./src" }}],
	["./babel-plugins/babel-plugin-import-dir"]
]

const serverBundlerConfig = {
	"includeExternalModules": false,
	"babelPlugins": bundlerBabelPlugins
}

const clientBundlerConfig = {
	"includeExternalModules": true,
	"babelPlugins": bundlerBabelPlugins
}

const cacheFolder = "beelder-cache/build-files";
const stylesheetPattern = "**/*.@(scss|css)";

const getClientResources = (config) => {
	return {
		"action": "bundle-javascript",
		"source": config.source,
		"compilerOptions": {
			...clientBundlerConfig,
			"plugins": [{
				"plugin": "resource-plugin",
				"rules": [{
					"pattern": "**/*.glsl",
					"target": `#${config.targetName}-shader-list = ${cacheFolder}/temp/${config.targetName}/shader-list.json`
				}, {
					"pattern": stylesheetPattern,
					"target": `#${config.targetName}-style-list = ${cacheFolder}/temp/${config.targetName}/style-list.json`
				}]
			}]
		}
	}
}

const exportShaders = (config) => {
	return {
		"action": "create-shader-library",
		"source": `#${config.targetName}-shader-list`,
		"target": config.target
	}
}

const exportStylesheets = (config) => {
	return {
		"action": "compile-scss",
		"source": `#${config.targetName}-style-list`,
		"target": config.target
	}
}

const insertShadersPlugin = (config) => {
	return {
		"plugin": "json-comment-replacer",
		"replacements": [{
			"comment": "@shader-loader-placeholder",
			"file": config.file
		}]
	}
}

module.exports = {
	"schemes": {
		"release-server": {
			"steps": [{
				"action": "delete",
				"target": "dist/server/index.js"
			}, {
				"action": "delete",
				"target": "dist/server/index.js.map"
			}, {
				"action": "delete",
				"target": "dist/server/resources"
			}, {
				"action": "copy",
				"source": "#server-build",
				"target": "#server = dist/"
			}]
		},

		"build-server": {
			"steps": [{
				"action": "bundle-javascript",
				"source": "src/server/main.ts",
				"target": `${cacheFolder}/server/index.js`,
				"compilerOptions": serverBundlerConfig
			}, {
				"action": "copy",
				"source": "#game",
				"target": `${cacheFolder}/server/resources/web/`
			}, {
				"action": "copy",
				"source": "#hub",
				"target": `${cacheFolder}/server/resources/web/`
			}, {
				"action": "copy",
				"source": "src/client/web/default",
				"target": `${cacheFolder}/server/resources/web/`
			}, {
				"action": "copy",
				"source": "src/library/blessed-fork/usr",
				"target": `${cacheFolder}/server/resources/terminal/`
			}, {
				"action": "copy",
				"source": "src/server/maps",
				"target": `${cacheFolder}/server/resources/`
			}, {
				"action": "copy",
				"source": "src/server/preferences/default.json",
				"target": `${cacheFolder}/server/resources/default-preferences.json`
			}, {
				"action": "copy",
				"source": "src/server/scripts",
				"target": `${cacheFolder}/server/resources/`
			}],
			"targets": [
				`#server-build = ${cacheFolder}/server`
			]
		},

		"build-texture-atlas": {
			"steps": [{
				"action": "texture-atlas",
				"source": "src/client/textures",
				"target": `#texture-atlas = ${cacheFolder}/textures`,
				"atlasSize": 2048
			}]
		},
		"prepare-game-resources": {
			"steps": [
				getClientResources({
					source: "src/client/game/index.ts",
					targetName: "game"
				}),
				getClientResources({
					source: "src/client/game-launcher/index.ts",
					targetName: "game-launcher"
				})
			]
		},
		"compile-game-resources": {
			"steps": [
				// Writing shader library to temp folder, because
				// we don't want this json to appear in the bundle.
				exportShaders({
					targetName: "game",
					target: `#game-shaders = ${cacheFolder}/temp/game/game-shaders.json`
				}),
				// Writing styles directly in the bundle
				exportStylesheets({
					targetName: "game",
					target: `#game-styles = ${cacheFolder}/game/styles/game-styles.css`
				}),
				exportStylesheets({
					targetName: "game-launcher",
					target: `#game-launcher-styles = ${cacheFolder}/game/styles/game-launcher-styles.css`
				})
			]
		},
		"build-game": {
			"steps": [{
				"action": "bundle-javascript",
				"source": "src/client/game-launcher/index.ts",
				"target": `#game-launcher = ${cacheFolder}/game/scripts/index.js`,
				"compilerOptions": clientBundlerConfig
			}, {
				"action": "bundle-javascript",
				"source": "src/client/game/index.ts",
				"target": `#game-executable = ${cacheFolder}/game/scripts/game.js`,
				"compilerOptions": {
					...clientBundlerConfig,
					"plugins": [
						insertShadersPlugin({
							file: "#game-shaders"
						})
					]
				}
			}, {
				"action": "copy",
				"source": "src/client/web/game",
				"target": `${cacheFolder}/game`
			}, {
				"action": "copy",
				"source": "#texture-atlas",
				"target": `${cacheFolder}/game/assets/img/textures`,
				"atlasSize": 2048
			}],
			"targets": [ `#game = ${cacheFolder}/game` ]
		},

		"build-hub": {
			"steps": [{
				"action": "bundle-javascript",
				"source": "src/client/hub/index.ts",
				"target": `${cacheFolder}/hub/scripts/index.js`,
				"compilerOptions": clientBundlerConfig
			}, {
				"action": "copy",
				"source": "src/client/web/hub",
				"target": `${cacheFolder}/hub`
			}],
			"targets": [ `#hub = ${cacheFolder}/hub` ]
		},

		"prepare-map-editor-resources": {
			"steps": [
				getClientResources({
					 source: "src/client/map-editor/index.ts",
					 targetName: "map-editor"
				}),
				getClientResources({
					 source: "src/client/map-editor-launcher/index.ts",
					 targetName: "map-editor-launcher"
				})
			]
		},
		"compile-map-editor-resources": {
			"steps": [
				// Writing shader library to temp folder, because
				// we don't want this json to appear in the bundle.
				exportShaders({
					  targetName: "map-editor",
					  target: `#map-editor-shaders = ${cacheFolder}/temp/map-editor/map-editor-shaders.json`
				}),
				// Writing styles directly in the bundle
				exportStylesheets({
					targetName: "map-editor",
					target: `#map-editor-styles = ${cacheFolder}/map-editor/styles/map-editor-styles.css`
				}),
				exportStylesheets({
					targetName: "map-editor-launcher",
					target: `#map-editor-launcher-styles = ${cacheFolder}/map-editor/styles/map-editor-launcher-styles.css`
				})
			]
		},
		"build-map-editor": {
			"steps": [{
				"action": "bundle-javascript",
				"source": "src/client/map-editor-launcher/index.ts",
				"target": `#map-editor-launcher = ${cacheFolder}/map-editor/scripts/index.js`,
				"compilerOptions": clientBundlerConfig,
			}, {
				"action": "bundle-javascript",
				"source": "src/client/map-editor/index.ts",
				"target": `#map-editor-executable = ${cacheFolder}/map-editor/scripts/map-editor.js`,
				"compilerOptions": {
					...clientBundlerConfig,
					"plugins": [
						insertShadersPlugin({
							file: "#map-editor-shaders"
						})
					]
				},
			}, {
				"action": "copy",
				"source": "src/client/web/map-editor",
				"target": `${cacheFolder}/map-editor`
			}, {
				"action": "copy",
				"source": "#texture-atlas",
				"target": `${cacheFolder}/map-editor/assets/img/textures`,
				"atlasSize": 2048
			}],
			"targets": [ `#map-editor-build = ${cacheFolder}/map-editor` ]
		},
		"release-map-editor": {
			"steps": [{
				"action": "delete",
				"target": "#map-editor"
			}, {
				"action": "copy",
				"source": "#map-editor-build",
				"target": "#map-editor = dist/map-editor",
			}]
		}
	}
}