
import ActivatorAxle from "../../controls/activator-axle";

export type AxleCallback = (axle: CallbackActivatorAxle) => void

export default class CallbackActivatorAxle extends ActivatorAxle {

    private readonly shouldUpdateCallback?: AxleCallback;
    private readonly activateCallback?: AxleCallback;
    private readonly deactivateCallback?: AxleCallback;

    constructor(shouldUpdateCallback?: AxleCallback, activateCallback?: AxleCallback, deactivateCallback?: AxleCallback) {
        super()
        this.shouldUpdateCallback = shouldUpdateCallback;
        this.activateCallback = activateCallback;
        this.deactivateCallback = deactivateCallback;
    }

    setNeedsUpdate() {
        super.setNeedsUpdate();
        if(this.shouldUpdateCallback) this.shouldUpdateCallback(this)
    }

    protected onActivated() {
        super.onActivated()
        if(this.activateCallback) this.activateCallback(this)
    }

    protected onDeactivated() {
        super.onDeactivated()
        if(this.deactivateCallback) this.deactivateCallback(this)
    }
}