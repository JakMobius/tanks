/*
This code is a modified version of https://github.com/gjbkz/rollup-plugin-glob-import

MIT License

Copyright 2017 Kei Ito (kei.itof@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import path from 'path';
import fs from 'fs';
import {createFilter} from 'rollup-pluginutils';
import glob from 'fast-glob';

const camelCase = (input) => input.replace(/[-+*/:;.'"`?!&~|<>^%#=@[\]{}()\s\\]+([a-z]|$)/g, (_match, c) => c.toUpperCase());
const defaultRenamer = (name, id) => name || camelCase(path.basename(id, path.extname(id)));
const serializeImportSource = (file) => {
    if (!file.startsWith('/') && !file.startsWith('.')) {
        file = `./${file}`;
    }
    return `'${file}'`;
};
const listNameMapping = function* (id, namedExports, rename) {
    for (const name of namedExports) {
        const exported = rename(name, id);
        if (exported) {
            yield name === exported ? name : `${name} as ${exported}`;
        }
    }
};
const IntermediateFileFormat = {
    import: 'import',
    named: 'named',
    default: 'default',
    mixed: 'mixed',
    textures: 'textures',
};

const codeGenerator = {
    *[IntermediateFileFormat.default](files, importer, options) {
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const id = path.join(path.dirname(importer), file);
            const exported = options.rename(null, id);
            if (exported) {
                yield `import _${index} from ${serializeImportSource(file)};`;
                yield `export {_${index} as ${exported}};`;
            }
        }
    },
    *[IntermediateFileFormat.named](files) {
        for (const file of files) {
            yield `export * from ${serializeImportSource(file)};`;
        }
    },
    *[IntermediateFileFormat.import](files) {
        for (const file of files) {
            yield `import ${serializeImportSource(file)};`;
        }
    },
    *[IntermediateFileFormat.mixed](files, importer, options) {
        const acornOptions = Object.assign({sourceType: 'module'}, options.acorn);
        for (let index = 0; index < files.length; index++) {
            let imported = false;
            const file = files[index];
            const id = path.join(path.dirname(importer), file);
            const namedExports = [];
            for (const node of this.parse(fs.readFileSync(id, 'utf8'), acornOptions).body) {
                const {type} = node;
                if (type === 'ExportAllDeclaration') {
                    let from = node.source.value;
                    if (from.startsWith('.')) {
                        from = path.join(path.dirname(file), from).split(path.sep).join('/');
                        yield `export * from ${serializeImportSource(from)};`;
                    } else {
                        yield `export * from '${from}';`;
                    }
                    imported = true;
                } else if (type === 'ExportDefaultDeclaration') {
                    const exported = options.rename(null, id);
                    if (exported) {
                        yield `import _${index} from ${serializeImportSource(file)};`;
                        yield `export {_${index} as ${exported}};`;
                        imported = true;
                    }
                } else if (type === 'ExportNamedDeclaration') {
                    for (const specifier of node.specifiers) {
                        namedExports.push(specifier.exported.name);
                    }
                    if (node.declaration) {
                        for (const declaration of node.declaration.declarations || [node.declaration]) {
                            namedExports.push(declaration.id.name);
                        }
                    }
                }
            }
            const nameMapping = [...listNameMapping(id, namedExports, options.rename)];
            if (0 < nameMapping.length) {
                yield `export {${nameMapping.join(', ')}} from ${serializeImportSource(file)};`;
                imported = true;
            }
            if (!imported) {
                yield `import ${serializeImportSource(file)};`;
            }
        }
    },
    *[IntermediateFileFormat.textures](files, importer, options) {
        const acornOptions = Object.assign({sourceType: 'module'}, options.acorn);
        for (let index = 0; index < files.length; index++) {
            yield `import texture${index} from ${serializeImportSource(files[index])};`;
        }
        let result = "export default [\n"
        for (let index = 0; index < files.length; index++) {
            result += `\ttexture${index},\n`
        }
        result += "];"
        yield result;
    },
};

const plugin = (options = {}) => {
    options = Object.assign({format: IntermediateFileFormat.mixed}, options);
    if (options.rename && options.format !== IntermediateFileFormat.default) {
        options.format = IntermediateFileFormat.mixed;
    }
    options.rename = options.rename || defaultRenamer;
    const generateCode = codeGenerator[options.format];
    if (!generateCode) {
        throw new Error(`InvalidFormat: ${options.format}`);
    }
    const filter = createFilter(options.include, options.exclude);
    const generatedCodes = new Map();
    return {
        name: 'glob-import',
        async resolveId(importee, importer) {
            if (!filter(importer) || !importee.includes('%')) {
                return null;
            }
            importee = importee.replace(/\%/g, '*')
            const importerDirectory = path.dirname(importer);
            let files = await glob(importee, {
                cwd: importerDirectory,
            });
            if (options.intercept) {
                files = options.intercept(files.slice(), importee, importer);
            }
            const code = [...generateCode.call(this, files, importer, options)].join('\n');
            const tempPath = path.join(importerDirectory, importee.replace(/\W/g, (c) => `_${c.codePointAt(0)}_`));
            generatedCodes.set(tempPath, code);
            return tempPath;
        },
        load(id) {
            return generatedCodes.get(id);
        },
    };
};

export default Object.assign(
    plugin,
    {
        plugin,
        defaultRenamer,
        camelCase,
        IntermediateFileFormat,
    },
);