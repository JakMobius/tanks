
import ScheduledTask from './scheduledtask';

class Loop {
	public schedule = new Map<number, ScheduledTask>();
	public schedules: any;
	public ticks: any;
	public loopTimestamp: any;
	public maximumTimestep: any;
	public timeMultiplier: any;
	public run: any;
	public running: any;

    constructor() {
        this.schedule = new Map()
        this.schedules = 0;
        this.ticks = 0
        this.loopTimestamp = 0
        this.maximumTimestep = 0.1
        this.timeMultiplier = 1
        this.run = null
    }

    start() {
        this.running = true
    }

    stop() {
        this.running = false
    }

    cycle(dt: number) {}

    runScheduledTasks(dt: number) {
        ScheduledTask.lockInitialTimers = true
        for(let [key, task] of this.schedule.entries()) {
            if(task.tick(dt)) {
                this.schedule.delete(key)
            }
        }
        ScheduledTask.lockInitialTimers = false
    }

    perform(timestamp?: number) {
        if(timestamp === undefined) {
            timestamp = Date.now()
        }
        this.ticks++
        if(this.running) {
            let dt

            if (this.loopTimestamp) {
                dt = (timestamp - this.loopTimestamp) * this.timeMultiplier
                if (dt > this.maximumTimestep) dt = this.maximumTimestep
            } else {
                dt = 0;
            }

            this.loopTimestamp = timestamp

            this.runScheduledTasks(dt)

            if(this.run) {
                this.run(dt)
            }

            this.cycle(dt)
        } else {
            this.loopTimestamp = undefined
        }
    }

    scheduleTask(func: () => void, time: number) {
        time = time || 0
        let index = this.schedules ++

        this.schedule.set(index, new ScheduledTask(func, time))

        return index
    }
}

export default Loop;