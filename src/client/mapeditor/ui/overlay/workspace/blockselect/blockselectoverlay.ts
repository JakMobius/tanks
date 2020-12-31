
import Overlay from '@/client/ui/overlay/overlay';
import BlockSelectMenu from './blockselectmenu';

class BlockSelectOverlay extends Overlay {
	public menu: any;
	public overlay: any;
	public hide: any;
	public emit: any;

    constructor(options) {
        super(options);

        this.menu = new BlockSelectMenu()
        this.overlay.append(this.menu.element)

        this.overlay.attr("tabindex", 1)
        this.overlay.keydown((event) => {
            if(event.key === "Escape") {
                this.hide()
            }
        })

        this.overlay.on("click", (event) => {
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