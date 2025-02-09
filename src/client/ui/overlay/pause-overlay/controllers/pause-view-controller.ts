import Controller from "src/client/ui/controller/controller";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";

export default class PauseViewController extends Controller {

    controlsEventListener = new BasicEventHandlerSet()

    constructor() {
        super();

        this.controlsEventListener.on("navigate-back", () => this.navigateBack())
    }

    navigateBack() {
        let navigationView = this.navigationView
        if (navigationView.stack.length == 1) navigationView.emit("close")
        else navigationView.popController()
    }

    onFocus() {
        super.onFocus();
        this.controlsEventListener.setTarget(this.controlsResponder)
    }

    onBlur() {
        super.onBlur();
        this.controlsEventListener.setTarget(null)
    }
}