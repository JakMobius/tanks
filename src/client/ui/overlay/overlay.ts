/* @load-resource: './overlay.scss' */

import EventEmitter from '../../../utils/eventemitter';

class Overlay extends EventEmitter {
	public overlay: any;
	public shown: any;
	public root: any;

    constructor(options) {
        super()
        this.overlay = $("<div>").addClass("overlay")
        this.shown = false
        this.root = options.root
        this.root.append(this.overlay)
        this.overlay.hide()
    }

    show() {
        if(this.shown) { return }

        this.shown = true
        this.overlay.show()
        this.overlay.fadeIn()
        this.overlay[0].focus()
    }

    hide(callback?) {
        if(!this.shown) { return }

        this.shown = false
        this.overlay.fadeOut(700, callback)
        this.overlay[0].blur()
    }

    static menu() {
        return $("<div>").addClass("menu")
    }
}

export default Overlay;