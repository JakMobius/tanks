import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import sass from 'rollup-plugin-sass'
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

const projectRootDir = path.resolve(__dirname);

const sharedPlugins = () => [
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
	typescript(),
	commonjs(),
	replace({
		preventAssignment: false,
		'process.env.NODE_ENV': production ? '"production"' : '"development"'
	}),
	production && terser(),
]

const serverBuild = (config) => {
	return {
		input: config.entry,
		output: {
			file: config.output,
			format: 'es',
			sourcemap: true
		},
		external: [/node_modules/],
		plugins: [
			...sharedPlugins(),
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
	}
}

const clientBuild = (config) => {
	let texturesPath = "src/client/textures/"
	let texturesExtension = ".texture.png"

	return {
		input: config.entry,
		output: {
			file: config.output,
			format: 'iife',
			sourcemap: true
		},
		plugins: [
			...sharedPlugins(),
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
			config.stylesOutput && sass({
				api: 'modern',
				output: config.stylesOutput,
			}),
		]
	}
}

export default [
	clientBuild({
		entry: 'src/client/game-launcher/index.ts',
		output: 'dist/resources/web/static/index.js',
		// TODO: sass plugin uses fs.writeFileSync directly. Consider opening a PR
		stylesOutput: 'dist/resources/web/static/styles/launcher-styles.css'
	}),
	clientBuild({
		entry: 'src/client/index.ts',
		output: 'dist/resources/web/static/main.js',
		atlasOutput: 'textures',
		stylesOutput: 'dist/resources/web/static/styles/styles.css'
	}),
	serverBuild({
		entry: 'src/server/main.ts',
		output: 'dist/index.js'
	}),
	serverBuild({
		entry: 'test/test.ts',
		output: 'test/test.js'
	})
];