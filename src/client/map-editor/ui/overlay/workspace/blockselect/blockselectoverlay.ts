import Overlay, {OverlayConfig} from 'src/client/ui/overlay/overlay';
import BlockSelectMenu from './blockselectmenu';
import MenuOverlay from "../../../../../ui/menu-overlay/menu-overlay";

class BlockSelectOverlay extends MenuOverlay {
	public menu = new BlockSelectMenu();

    constructor(options: OverlayConfig) {
        super(options);

        this.menu = new BlockSelectMenu()
        this.overlay.append(this.menu.element)

        this.overlay.attr("tabindex", 1)
        this.overlay.on("keydown", (event: JQuery.TriggeredEvent) => {
            if(event.key === "Escape") {
                this.hide()
            }
        })

        this.overlay.on("click", (event: JQuery.TriggeredEvent) => {
            if(event.target === this.overlay[0]) {
                this.hide()
            }
        })

        this.menu.on("select", (name, block) => {
            this.emit("select", name, block)
            this.hide()
        })
    }
}

export default BlockSelectOverlay;