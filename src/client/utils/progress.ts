
class Progress {
	public completed: any;
	public target: any;
	public subtasks: any;
	public fraction: any;
	public refresh: any;
	public parent: any;

    constructor() {
        this.completed = 0
        this.target = 0
        this.subtasks = []
        this.fraction = 0
        this.refresh = false
        this.parent = null
    }

    addSubtask(task) {
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
    }

    setNeedsUpdate() {
        if(this.parent) {
            this.parent.setNeedsUpdate()
        }

        this.refresh = true
    }

    setTarget(target) {
        this.target = target
        this.setNeedsUpdate()
    }

    getTarget() {
        return this.target
    }

    setCompleted(completed) {
        this.completed = completed
        this.setNeedsUpdate()
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
}

export default Progress;