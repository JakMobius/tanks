/* @load-resource: './overlay.scss' */

import EventEmitter from '../../../utils/event-emitter';

export interface OverlayConfig {
    root: JQuery
}

export default class Overlay extends EventEmitter {
	public overlay = $("<div>").addClass("overlay");
	public shown = false;
	public root: JQuery;

    constructor(options: OverlayConfig) {
        super()
        this.root = options.root
        this.root.append(this.overlay)
        this.overlay.hide()
    }

    show() {
        if(this.shown) { return }

        this.shown = true
        this.overlay.show()
        this.overlay.trigger("focus")
    }

    hide(callback?: () => void): void {
        if(!this.shown) { return }

        this.shown = false
        this.overlay.trigger("blur")
        this.overlay.hide()
        if(callback) setTimeout(callback)
    }

    static menu() {
        return $("<div>").addClass("menu")
    }
}