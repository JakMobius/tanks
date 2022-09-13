/* @load-resource: './menu-overlay.scss' */

import Overlay, {OverlayConfig} from "../overlay/overlay";

export default class MenuOverlay extends Overlay {
    constructor(options: OverlayConfig) {
        super(options)
        this.overlay.addClass("menu-overlay")
    }
}