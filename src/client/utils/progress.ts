import EventEmitter from "src/utils/event-emitter";
import { finished } from "stream";

export abstract class Progress extends EventEmitter {
    static empty() {
        return Progress.completed().setWeight(0)
    }

    static failed(error: any = undefined) {
        let result = new ProgressLeaf()
        Promise.resolve().then(() => result.fail(error))
        return result
    }

    static completed() {
        let result = new ProgressLeaf()
        Promise.resolve().then(() => result.complete())
        return result
    }

    static parallel(progresses: Progress[]) {
        if (progresses.length === 0) {
            return Progress.completed()
        }

        let result = new ProgressGroup()

        for (let progress of progresses) {
            result.addSubtask(progress)
        }

        return result
    }

    static sequential(progresses: (() => Progress)[]) {
        if (progresses.length === 0) {
            return Progress.completed()
        }

        let result = new ProgressGroup()
        let subtasks = progresses.map(_ => new ProgressGroup().setOverrideWeight(1))

        for (let subtask of subtasks) result.addSubtask(subtask)

        let index = 0
        const next = () => {
            if (index >= progresses.length) {
                return
            }

            let progress = progresses[index]()
            subtasks[index].addSubtask(progress)
            progress.on("completed", () => {
                index++
                next()
            })
        }

        next()
        return result
    }

    toPromise(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.on("completed", resolve)
            this.on("error", reject)
        })
    }

    abstract abort(): void

    abstract getFraction(): number

    abstract getWeight(): number
}

export class ProgressLeaf extends Progress {
    public completed: boolean = false
    public failed: boolean = false
    private weight: number = 1
    private completedFraction: number = 0

    complete() {
        this.setFraction(1)
        return this
    }

    setWeight(weight: number) {
        this.weight = weight
        this.emit("update")

        return this
    }

    getWeight() {
        return this.weight
    }

    setFraction(completedFraction: number) {
        this.completedFraction = completedFraction
        this.emit("update")

        if (this.completedFraction === 1 && !this.completed && !this.failed) {
            this.completed = true
            this.emit("completed")
        }

        return this
    }

    setFraction2(total: number, completed: number) {
        if (total === 0) {
            this.setFraction(0)
        } else {
            this.setFraction(completed / total)
        }
    }

    getFraction() {
        return this.completedFraction
    }

    abort() {
        if(this.completed) return
        this.failed = true
        this.emit("abort")
    }

    fail(reason: any) {
        if (this.failed) {
            return
        }
        this.failed = true
        this.emit("error", reason)
    }
}

export class ProgressGroup extends Progress {
    public subtasks: Progress[] = []

    private failed: boolean = false
    private completed: boolean = false

    private weight: number | null = null
    private overrideWeight: number | null = null
    private fraction: number = 0
    private dirty: boolean = false

    addSubtask(task: Progress) {
        task.on("update", () => {
            this.setNeedsUpdate()
        })

        task.on("error", (reason) => {
            this.failed = true
            this.emit("error", reason)
        })

        this.subtasks.push(task)
        this.setNeedsUpdate()

        return this
    }

    setNeedsUpdate() {
        this.emit("update")
        this.dirty = true
        return this
    }

    getWeight() {
        if (this.overrideWeight !== null) {
            return this.overrideWeight
        }
        if (this.dirty) {
            this.refreshFraction()
        }
        return this.weight
    }

    setOverrideWeight(weight: number | null) {
        this.overrideWeight = weight
        this.setNeedsUpdate()
        return this
    }

    private refreshFraction() {
        this.dirty = false

        let totalWeight = 0
        for (let subtask of this.subtasks) {
            totalWeight += subtask.getWeight()
        }

        this.weight = totalWeight

        let totalFraction = 0
        for (let task of this.subtasks) {
            totalFraction += task.getFraction() * task.getWeight()
        }

        if (totalWeight === 0) {
            if(this.subtasks.length === 0) {
                this.fraction = 0
            } else {
                this.fraction = 1
            }
        } else {
            this.fraction = totalFraction / totalWeight
        }

        if (this.fraction === 1 && !this.failed && !this.completed) {
            this.completed = true
            this.emit("completed")
        }
    }

    getFraction(): number {
        if (this.dirty) {
            this.refreshFraction()
        }
        return this.fraction
    }

    abort() {
        for(let progress of this.subtasks) {
            progress.abort()
        }
        this.emit("abort")
    }
}