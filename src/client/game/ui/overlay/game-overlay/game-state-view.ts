/* @load-resource: './state-view.scss' */

import View from "src/client/ui/view";
import TDMGameOverlay from "./tdm-game-overlay/tdm-game-overlay";

export default class GameStateView extends View {
    header = $("<div>").addClass("overlay-header")
    text = $("<div>").addClass("overlay-text")
    overlay: TDMGameOverlay
    protected shown = false
    private showTimer: number | null = null

    constructor(overlay: TDMGameOverlay) {
        super()
        this.element.addClass("overlay-menu")
        this.element.append(this.header, this.text)
        this.overlay = overlay
    }

    onAttach() {

    }

    onDetach() {

    }

    protected show() {
        if(this.shown) return
        this.shown = true
        this.element.show()
        this.element.addClass("shown")
    }

    hide() {
        if(!this.shown) return
        this.shown = false
        this.element.removeClass("shown")
        this.showTimer = window.setTimeout(() => {
            this.element.hide()
            this.showTimer = null
        }, 300)
    }
}