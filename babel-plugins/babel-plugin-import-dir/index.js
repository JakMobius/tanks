
/*
    Thw following file is a modified version of bluepropane/babel-plugin-import-dir
    babel plugin with some fixes (namely - https://github.com/bluepropane/babel-plugin-import-dir/issues/8).
    Seems like this repository is abandomed, so I had to copy and modify it directly.
 */

const fs = require('fs');
const pathJoin = require('path').join;
const glob = require('glob');

const MATCH_MODULE_FILES = /\.(js|jsx|ts)$/g;
const utils = {};

utils.modulePathToName = function(modulePath) {
    return [modulePath.split('/').slice(-1)[0], modulePath];
};

utils.modulePathToInfo = function(modulePath) {
    return {
        path: modulePath,
        name: modulePath.split('/').slice(-1)[0],
    };
};

utils.getModulesFromPattern = function(pattern, cwd) {
    const dirs = glob.sync(pattern, { mark: true, cwd });
    return dirs
        .filter(mod => {
            let result = MATCH_MODULE_FILES.exec(mod) || mod.endsWith('/')
            MATCH_MODULE_FILES.lastIndex = 0
            return result
        })
        .map(mod => {
            if (mod.endsWith('/')) {
                mod = mod.slice(0, -1);
            } else {
                mod = mod.replace(MATCH_MODULE_FILES, '');
            }
            return mod;
        });
};

utils.getFinalPath = function(path) {
    return path
        .split('/')
        .filter(subPath => subPath !== '')
        .slice(-1);
};

utils.prependDotSlash = function(moduleInfo) {
    moduleInfo.forEach(mod => {
        if (!mod.path.startsWith('./')) {
            mod.path = './' + mod.path;
        }
    });
};

class ImportDeclarationHandler {
    constructor({ path, state, t } = { path: {}, state: {} }) {
        this.setContext(path, state, t);
        this.output = [];
    }

    setContext = (path, state, t) => {
        const { node } = path;
        const context = { path, state, t, node };
        context.cwd = state.file.opts.filename.replace(/(.*)\/[\w-.]+$/, '$1');
        context.targetPattern = node.source.value;
        const moduleInfo = utils
            .getModulesFromPattern(context.targetPattern, context.cwd)
            .map(utils.modulePathToInfo);

        context.modulePaths = moduleInfo.reduce((accum, { path, name }) => {
            accum[name] = path;
            return accum;
        }, {});

        context.importedModuleIdentifiers = moduleInfo.reduce((accum, { name }) => {
            accum[name] = path.scope.generateUidIdentifier(name);
            return accum;
        }, {});
        this.context = context;
    };

    transformSpecifier = node => {
        let output;
        const { importedModuleIdentifiers, modulePaths, t } = this.context;
        if (this.hasDefaultImportSpecifier) {
            output = t.variableDeclaration('const', [
                t.variableDeclarator(
                    t.identifier(node.local.name),
                    importedModuleIdentifiers[node.local.name]
                ),
            ]);
        } else {
            output = t.importDeclaration(
                [t.importDefaultSpecifier(t.identifier(node.local.name))],
                t.stringLiteral(modulePaths[node.local.name])
            );
        }

        this.output.push(output);
    };

    transformDefaultSpecifier = node => {
        const { importedModuleIdentifiers, modulePaths, t, path } = this.context;
        const targetImports = [];
        const exportedName = node.local.name;

        for (let moduleName in modulePaths) {
            this.output.push(
                t.importDeclaration(
                    [t.importDefaultSpecifier(importedModuleIdentifiers[moduleName])],
                    t.stringLiteral(modulePaths[moduleName])
                )
            );
        }
    };

    generateDefaultExportObject = () => {
        const { path, importedModuleIdentifiers, t } = this.context;
        const defaultExportObject = t.variableDeclaration('const', [
            t.variableDeclarator(
                t.identifier(path.node.specifiers[0].local.name),
                t.arrayExpression(
                    Object.entries(importedModuleIdentifiers).map(
                        ([moduleName, importedModuleId]) => {
                            return importedModuleId
                        })
                )
            )
        ]);
        return defaultExportObject;
    };

    run() {
        const { t, node } = this.context;
        node.specifiers.map(specifierNode => {
            if (t.isImportDefaultSpecifier(specifierNode)) {
                this.hasDefaultImportSpecifier = true;
                this.transformDefaultSpecifier(specifierNode);
            } else if (t.isImportSpecifier(specifierNode)) {
                this.transformSpecifier(specifierNode);
            }
        });
        if (this.hasDefaultImportSpecifier) {
            this.output.push(this.generateDefaultExportObject());
        }
    }
}

module.exports = ({ types: t }) => {
    return {
        visitor: {
            ImportDeclaration(path, state) {
                const { node } = path;
                if ((utils.getFinalPath(node.source.value)[0] || []).includes('*')) {
                    const h = new ImportDeclarationHandler({ path, state, t });
                    h.run();
                    path.replaceWithMultiple(h.output);
                }
            },
        },
    };
};