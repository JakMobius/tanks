
import Overlay, {OverlayConfig} from '../../../../ui/overlay/overlay';
import DialogView from './dialogview';

class DialogOverlay extends Overlay {
	public dialog: any;
	public requiresDecision: any;

    constructor(options: OverlayConfig) {
        super(options)

        this.dialog = new DialogView()
        this.overlay.append(this.dialog.element)
        this.requiresDecision = false
        this.dialog.on("decision", () => this.hide())
    }

    show() {
        this.overlay.attr("tabindex", 1)
        this.overlay.focus()

        if(!this.requiresDecision) {
            this.overlay.on("click", (event) => {
                if(this.overlay.has(event.target).length) {
                    this.hide()
                }
            })
            this.overlay.on("keydown", (event) => {
                if(event.code === "Escape") {
                    this.hide()
                }
            })
        }

        super.show()
    }

    hide(callback?: () => void) {
        this.overlay.blur()
        super.hide(() => {
            this.overlay.remove()
            callback && callback()
        })
    }
}

export default DialogOverlay;