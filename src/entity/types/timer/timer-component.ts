
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import { formatTimeMinSec } from "src/utils/utils";

// Timer component is the only component of the timer entity.
// It listens to the tick event and updates itself.

export default class TimerComponent extends EventHandlerComponent {
    currentTime: number = 0
    originalTime: number = 0

    needsUpdate: boolean = false
    updateFrequency: number = 1

    constructor() {
        super()
        this.eventHandler.on("tick", (dt) => this.onTick(dt))
    }

    setCountdownState(time: number, original: number) {
        this.originalTime = original
        this.currentTime = time
        this.needsUpdate = true
        return this
    }

    formatTimeMinSec() {
        return formatTimeMinSec(this.currentTime)
    }

    countdownFrom(time: number) {
        this.originalTime = time
        this.currentTime = time
        this.needsUpdate = true
        return this
    }

    private onTick(dt: number) {
        if (this.currentTime > 0) {
            this.currentTime -= dt

            if (this.currentTime < 0) {
                this.currentTime = 0
                this.entity.emit("timer-finished")
            } else if (this.shouldHaveUpdated(dt)) {
                this.needsUpdate = true
            }
        }

        if (this.needsUpdate) {
            this.entity.emit("timer-transmit")
            this.needsUpdate = false
        }
    }

    private shouldHaveUpdated(dt: number) {
        return Math.floor(this.currentTime / this.updateFrequency) != Math.floor((this.currentTime + dt) / this.updateFrequency)
    }
}
