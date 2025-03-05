
export default class ScheduledTask {
	public func: () => void;
	public time: number;

    constructor(func: () => void, time: number) {
        this.func = func
        this.time = time
    }

    tick(dt: number) {
        if((this.time -= dt) <= 0) {
            this.func.apply(null)
            return true
        }
        return false
    }
}