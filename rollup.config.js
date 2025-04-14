import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import styles from "rollup-plugin-styler";
import shaders from './rollup/rollup-plugin-shaders.js'
import textureAtlas from './rollup/rollup-plugin-texture-atlas.js'
import globImport from './rollup/rollup-plugin-glob-import.js'
import copy from 'rollup-plugin-copy'
import replace from '@rollup/plugin-replace';

import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const production = !!process.env.PRODUCTION;
const projects = process.env.PROJECTS?.split(",") ?? [
	'client',
	'launcher',
	'server',
	'tests',
	'engine-editor'
];

const projectRootDir = path.resolve(__dirname);

const project = (projectName) => {
	return projects.indexOf(projectName) !== -1;
}

const sharedPlugins = (side) => [
	alias({
		entries: [
			{
				find: 'src',
				replacement: path.resolve(projectRootDir, 'src')
			},
			{
				find: 'textures',
				replacement: path.resolve(projectRootDir, 'src/client/textures')
			}
		]
	}),
	globImport({
		format: 'textures'
	}),
	json(),
	resolve({
		extensions: ['.ts', '.tsx', '.js', '.json'],
	}),
	typescript({
		// cacheDir: '.rollup.' + side + '.tscache'
	}),
	commonjs(),
	replace({
		preventAssignment: false,
		'process.env.NODE_ENV': production ? '"production"' : '"development"'
	}),
	production && terser(),
]

const serverBuild = (config) => {
	if(!config) return []
	return [{
		input: config.entry,
		output: {
			file: config.output,
			format: 'es',
			sourcemap: true
		},
		external: [/node_modules/],
		plugins: [
			...sharedPlugins("server"),
			copy({
				targets: [
					{ src: "src/client/web/static/*", dest: "dist/resources/web/static" },
					{ src: "src/client/web/views/*", dest: "dist/resources/web/views" },
					{ src: "src/server/preferences/default.json", dest: 'dist/resources/', rename: 'default-preferences.json' },
					{ src: "src/server/maps", dest: 'dist/resources/' },
					{ src: "src/server/scripts", dest: 'dist/resources/' }
				],
				copyOnce: true
			})
		]
	}]
}

const clientBuild = (config) => {
	if(!config) return []
	let texturesPath = "src/client/textures/"
	let texturesExtension = ".texture.png"

	return [{
		input: config.entry,
		output: {
			file: config.output,
			format: 'iife',
			sourcemap: true,
			assetFileNames: '[name][extname]',
		},
		plugins: [
			...sharedPlugins("client"),
			shaders({
				include: ["**/*.glsl"]
			}),
			config.atlasOutput && textureAtlas({
				include: [texturesPath + "**/*" + texturesExtension],
				output: config.atlasOutput,
				idTransformer: (id) => {
					return id.substring(texturesPath.length, id.length - texturesExtension.length)
				}
			}),
			config.stylesOutput && styles({
				mode: ["extract", config.stylesOutput]
			}),
			...(config.plugins ?? [])
		]
	}]
}

export default [
	...clientBuild(project('launcher') && {
		entry: 'src/client/game-launcher/index.ts',
		output: 'dist/resources/web/static/index.js',
		// TODO: sass plugin uses fs.writeFileSync directly. Consider opening a PR
		stylesOutput: 'styles/launcher-styles.css'
	}),
	...clientBuild(project('client') && {
		entry: 'src/client/index.ts',
		output: 'dist/resources/web/static/main.js',
		atlasOutput: 'textures',
		stylesOutput: 'styles/styles.css'
	}),
	...serverBuild(project('server') && {
		entry: 'src/server/main.ts',
		output: 'dist/index.js'
	}),
	...serverBuild(project('tests') && {
		entry: 'test/test.ts',
		output: 'test/test.js'
	}),
	...clientBuild(project('engine-editor') && {
		entry: 'src/tools/engine-editor/index.ts',
		output: 'dist/resources/web/static/tools/engine-editor/index.js',
		stylesOutput: 'styles.css',
		atlasOutput: 'textures',
		plugins: [
			copy({
				targets: [
					{ src: "src/tools/engine-editor/ui/index.html", dest: "dist/resources/web/static/tools/engine-editor" }
				],
				copyOnce: true
			})
		]
	}),
];