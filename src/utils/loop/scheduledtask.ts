
class ScheduledTask {
	public func: any;
	public time: any;
	public lock: any;
    static lockInitialTimers = false

    constructor(func: () => void, time: number) {
        this.func = func
        this.time = time
        this.lock = ScheduledTask.lockInitialTimers
    }

    tick(dt: number) {
        if(this.lock) {
            this.lock = false
            return false
        }
        if((this.time -= dt) <= 0) {
            this.func.apply(null)
            return true
        }
        return false
    }
}

export default ScheduledTask;