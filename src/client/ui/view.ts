import EventEmitter from '../../utils/eventemitter';

class View extends EventEmitter {

    /**
     * View raw element
     */
    element: JQuery;

    constructor() {
        super()
        this.element = $("<div>")
    }
}

export default View;