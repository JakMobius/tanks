import Axle from "./axle";

export default class ActivatorAxle extends Axle {
    activated = false

    getValue(): number {
        let value = super.getValue();
        if(value > 0.5) {
            if(!this.activated) {
                this.activated = true
                this.onActivated()
            }
        } else {
            if(this.activated) {
                this.activated = false
                this.onDeactivated()
            }
        }
        return value
    }

    protected onActivated() {

    }

    protected onDeactivated() {

    }
}