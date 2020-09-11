
class ScheduledTask {
    static lockInitialTimers = false

    constructor(func, time) {
        this.func = func
        this.time = time
        this.lock = ScheduledTask.lockInitialTimers
    }

    tick(dt) {
        if(this.lock) {
            this.lock = false
            return
        }
        if((this.time -= dt) <= 0) {
            this.func.apply(null)
            return true
        }
        return false
    }
}

module.exports = ScheduledTask