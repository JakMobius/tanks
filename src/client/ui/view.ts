import EventEmitter from '../../utils/event-emitter';

export default class View extends EventEmitter {

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