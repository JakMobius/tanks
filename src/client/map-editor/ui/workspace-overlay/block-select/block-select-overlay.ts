/* @load-resource: './block-select-overlay.scss' */

import BlockSelectMenu from 'src/client/map-editor/ui/workspace-overlay/block-select/block-select-menu';
import Overlay from "src/client/ui/overlay/overlay";

export default class BlockSelectOverlay extends Overlay {
	public menu = new BlockSelectMenu();

    constructor() {
        super();

        this.menu = new BlockSelectMenu()
        this.element.addClass("block-select-overlay")
        this.element.append(this.menu.element)

        this.element.on("keydown", (event: JQuery.TriggeredEvent) => {
            if(event.key === "Escape") {
                this.hide()
            }
        })

        this.element.on("click", (event: JQuery.TriggeredEvent) => {
            if(event.target === this.element[0]) {
                this.hide()
            }
        })

        this.menu.on("select", (name, block) => {
            this.emit("select", name, block)
            this.hide()
        })
    }
}