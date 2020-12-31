import EventEmitter from '../../utils/eventemitter';

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

export default View;