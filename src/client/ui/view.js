const EventEmitter = require("../../utils/eventemitter")

class View extends EventEmitter {

    /**
     * View raw element
     * @type {jQuery}
     */
    element = null;

    constructor() {
        super()
        this.element = $("<div>")
    }
}

module.exports = View