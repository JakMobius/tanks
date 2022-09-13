
export default class CancellableEvent {
    cancelled: boolean = false

    cancel() {
        this.cancelled = true
    }
}