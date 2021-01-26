
const AsyncEventEmitter = require("../utils/async-eventemitter")

class BuilderSchemeCache extends AsyncEventEmitter {
    constructor() {
        super();
        this.cache = {}
    }

    async destroy() {
        await this.emit("destroy")
    }
}

module.exports = BuilderSchemeCache