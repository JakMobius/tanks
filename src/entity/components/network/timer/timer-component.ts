import {Component} from "src/utils/ecs/component";
import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Entity from "src/utils/ecs/entity";
import TimerTransmitter from "./timer-transmitter";

// Timer component is the only component of the timer entity.
// It listens to the tick event and updates itself.

export default class TimerComponent implements Component {
    entity: Entity | null = null
    eventHandler = new BasicEventHandlerSet()
    time: number = 0
    needsUpdate: boolean = false
    updateFrequency: number = 1

    constructor() {
        this.eventHandler.on("tick", (dt) => this.onTick(dt))

        this.eventHandler.on("transmitter-set-attached", (transmitterSet) => {
            transmitterSet.initializeTransmitter(TimerTransmitter)
        })
    }

    setTime(time: number) {
        this.time = time
        this.needsUpdate = true
    }

    getTimeString() {
        let minutes = String(Math.floor(this.time / 60))
        let seconds = String(Math.floor(this.time % 60))

        if(minutes.length == 1) minutes = "0" + minutes
        if(seconds.length == 1) seconds = "0" + seconds

        return minutes + ":" + seconds
    }

    private onTick(dt: number) {
        if(this.time > 0) {
            this.time -= dt

            if (this.time < 0) {
                this.time = 0
                this.entity.emit("timer-finished")
            } else if(this.shouldHaveUpdated(dt)) {
                this.needsUpdate = true
            }
        }

        if(this.needsUpdate) {
            this.entity.emit("timer-transmit")
            this.needsUpdate = false
        }
    }

    private shouldHaveUpdated(dt: number) {
        return Math.floor(this.time / this.updateFrequency) != Math.floor((this.time + dt) / this.updateFrequency)
    }

    onAttach(entity: Entity) {
        this.entity = entity
        this.eventHandler.setTarget(entity)
    }

    onDetach() {
        this.entity = null
        this.eventHandler.setTarget(null)
    }
}
