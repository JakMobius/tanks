
import Overlay, {OverlayConfig} from '../../../../ui/overlay/overlay';
import DialogView from './dialogview';

export interface DialogOverlayConfig extends OverlayConfig {
    requiresDecision?: boolean
}

class DialogOverlay extends Overlay {
	public dialog: DialogView;
	public requiresDecision: boolean;

    constructor(options: DialogOverlayConfig) {
        super(options)

        this.dialog = new DialogView()
        this.overlay.append(this.dialog.element)
        this.requiresDecision = options.requiresDecision ?? false
        this.dialog.on("decision", () => this.hide())
    }

    show() {
        this.overlay.attr("tabindex", 1)
        this.overlay.trigger("focus")

        if(!this.requiresDecision) {
            this.overlay.on("click", (event) => {
                if(this.overlay[0] == event.target) {
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