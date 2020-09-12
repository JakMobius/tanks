const Module = require('module');
const path = require('path')
const fs = require('fs')
const originalLoad = Module._load

Module._load = function(module, parent, isMain) {
    let folder = module.endsWith("/")
    if(module.startsWith("/")) {
        module = path.resolve(__dirname, "..", "..", module.substr(1))
    } else if(module.startsWith(".")) {
        module = path.resolve(parent.path, module)
    } else {
        return originalLoad.apply(this, arguments)
    }

    if(folder) {
        if(!fs.existsSync(module)) {
            // Github ignores empty folders, so
            // we're checking if folder doesn't
            // exist and assuming it's empty
            return []
        }
        return fs.readdirSync(module)
            .map(a => path.join(module, a))
            .map(each => {
                arguments[0] = each
                return originalLoad.apply(this, arguments)
            })
    }

    arguments[0] = module
    return originalLoad.apply(this, arguments)
}