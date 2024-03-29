import EventEmitter from "src/utils/event-emitter";

export default class Progress extends EventEmitter {
	public completed: number = 0
	public target: number = 0
	public subtasks: Progress[] = []
	public fraction: number = 0
	public refresh: boolean = false
	public parent?: Progress = null
    public failed: boolean = false

    constructor() {
        super()

        const self = this
        this.on("error", function() {
            if(self.parent)
                self.parent.emitArgs("error", Array.prototype.slice.call(arguments))
        })
    }

    addSubtask(task: Progress) {
        task.parent = this
        this.subtasks.push(task)
        this.setNeedsUpdate()
    }

    refreshFraction() {
        this.refresh = false

        let total = this.target + this.subtasks.length
        if(total === 0) {
            this.fraction = 0
            return
        }

        if(this.target === 0) {
            this.fraction = 0
        } else {
            this.fraction = this.completed
        }

        for(let task of this.subtasks) {
            this.fraction += task.completeFraction()
        }

        this.fraction /= total
    }

    complete() {
        if (this.target === 0) {
            this.target = 1
        }
        this.completed = this.target
        this.setNeedsUpdate()
        this.checkCompleted()
    }

    setNeedsUpdate() {
        if(this.parent) {
            this.parent.setNeedsUpdate()
        }

        this.refresh = true
    }

    setTarget(target: number) {
        this.target = target
        this.setNeedsUpdate()
    }

    getTarget() {
        return this.target
    }

    setCompleted(completed: number) {
        this.completed = completed
        this.setNeedsUpdate()

        if(this.completed == this.target) {
            this.checkCompleted()
        }
    }

    getCompleted() {
        return this.completed
    }

    completeFraction() {
        if(this.refresh) {
            this.refreshFraction()
        }
        return this.fraction
    }

    private checkCompleted() {
        let fraction = this.completeFraction()
        if(fraction == 1.0) {
            this.emit("completed")
        }
        if(this.parent)this.parent.checkCompleted()
    }

    toPromise(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.on("completed", resolve)
            this.on("error", reject)
        })
    }

    abort() {
        this.failed = true
        this.emit("abort")
    }

    fail(reason: string) {
        if(this.failed) {
            return
        }
        this.failed = true
        this.emit("error", reason)
    }

    static all(progresses: Progress[]) {
        let result = new Progress()

        for(let progress of progresses) {
            progress.on("error", (reason) => {
                result.fail(reason)
            })
            result.addSubtask(progress)
        }

        return result
    }
}