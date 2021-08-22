
import ScheduledTask from './scheduledtask';

export interface LoopConfig {
    /**
     * Maximum passed dt. Defaults to 100
     */
    maximumTimestep?: number

    /**
     * Time multiplier. When equal to one, dt corresponds to milliseconds. Defaults to 1
     */
    timeMultiplier?: number
}

export default class Loop {
	public schedule = new Map<number, ScheduledTask>();
	public schedules = 0;
	public ticks = 0;
	public loopTimestamp = 0;
	public maximumTimestep: number
	public timeMultiplier: number;
	public run: (dt: number) => void = null;
	public running: boolean = false;

	constructor(config: LoopConfig) {
	    config = Object.assign({
            maximumTimestep: 100,
            timeMultiplier: 1
        }, config)

	    this.maximumTimestep = config.maximumTimestep
        this.timeMultiplier = config.timeMultiplier
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

    scheduleTask(func: () => void, time: number = 0) {
        time = time || 0
        let index = this.schedules ++

        this.schedule.set(index, new ScheduledTask(func, time))

        return index
    }
}