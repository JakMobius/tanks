import { createFilter } from '@rollup/pluginutils';

export default function rollupPluginShaders(config) {

  const options = Object.assign({
    include: ["**/*.glsl"]
  }, config)

  const filter = createFilter(options.include)

  return {
    name: 'rollup-plugin-shaders',
    transform: (code, id) => {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: "" }
        }
      }
    }
  }
}