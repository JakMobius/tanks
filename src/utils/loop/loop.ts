import EventEmitter from '../event-emitter';
import ScheduledTask from './scheduled-task';

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

export default class Loop extends EventEmitter {
	public schedule = new Map<number, ScheduledTask>();
	public schedules = 0;
	public ticks = 0;
	public loopTimestamp = 0;
	public maximumTimestep: number
	public timeMultiplier: number;
	public running: boolean = false;

	constructor(config: LoopConfig) {
        super()
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
        let result = false
        if(!this.schedule.size) return result
        let schedule = this.schedule
        this.schedule = new Map()
        for(let [key, task] of schedule.entries()) {
            if(!task.tick(dt)) {
                this.schedule.set(key, task)
            } else {
                result = true
            }
        }
        return result
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

            this.cycle(dt)

            this.loopTimestamp = timestamp

            this.runScheduledTasks(dt)

            this.emit("tick", dt)
        } else {
            this.loopTimestamp = undefined
        }
    }

    clearScheduledTask(index: number) {
        this.schedule.delete(index)
    }

    scheduleTask(func: () => void, time: number = 0) {
        time = time || 0
        let index = this.schedules ++

        this.schedule.set(index, new ScheduledTask(func, time))

        return index
    }
}