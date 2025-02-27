import AdapterLoop from "src/utils/loop/adapter-loop";
import PhysicalHostComponent from "src/entity/components/physical-host-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class WorldPhysicalLoopComponent extends EventHandlerComponent {
    loop: AdapterLoop

    constructor(loop: AdapterLoop) {
        super()
        this.loop = loop
        this.eventHandler.on("tick", (dt: number) => {
            // console.log("physics")
            this.loop.timePassed(dt)

            // It's convenient to use physical loop schedule
            // when we speak about contact listeners. There is
            // almost nothing that can be done synchronously
            // in them. So we can just schedule a function call
            // to perform between the current and the next physics
            // step. The problem is that next game tick might occur
            // faster than next physics tick, which may cause some
            // synchronization issues. That is why loop schedule is
            // forcefully flushed after physics tick.

            while(this.loop.schedule.size) {
                this.loop.runScheduledTasks(0)
            }
        })

        loop.on("tick", () => this.entity.getComponent(PhysicalHostComponent).tickPhysics())
        loop.start()
    }
}