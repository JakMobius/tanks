
class Axle {
	public sources: any;
	public ownValue: any;
	public value: any;
	public destinations: any;
	public update: any;

    constructor() {
        this.sources = new Set<Axle>()
        this.ownValue = 0
        this.value = 0
        this.destinations = new Set<Axle>()
        this.update = false
    }

    addSource(source: Axle) {
        this.sources.add(source)
        source.destinations.add(this)
        this.setNeedsUpdate()
        return this
    }

    removeSource(source: Axle) {
        this.sources.delete(source)
        source.destinations.delete(this)
        this.setNeedsUpdate()
        return this
    }

    disconnectAll() {
        for(let destination of this.destinations.values()) {
            destination.removeSource(this)
        }
    }

    connect(destination: Axle) {
        destination.addSource(this)
    }

    getValue() {
        if (this.update) {
            this.update = false
            let result = this.ownValue
            for (let source of this.sources.values()) result += source.getValue()
            this.value = result
            return result
        } else {
            return this.value
        }
    }

    setValue(value: number) {
        this.ownValue = value
        this.setNeedsUpdate()
    }

    setNeedsUpdate() {
        this.update = true
        for(let destination of this.destinations.values())
            destination.setNeedsUpdate()
    }

    needsUpdate() {
        return this.update
    }
}

export default Axle;