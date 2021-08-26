import EventEmitter from '../../utils/event-emitter';

class View extends EventEmitter {

    /**
     * View raw element
     */
    element: JQuery;

    constructor() {
        super()
        this.element = $((this.constructor as typeof View).tagName)
    }

    static tagName = "<div>"
}

export default View;