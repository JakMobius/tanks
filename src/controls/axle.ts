
export default class Axle {
	public sources = new Set<Axle>();
	public ownValue: number = 0;
	public value: number = 0;
	public destinations = new Set<Axle>();
	public needsUpdate: boolean = false;

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
        if (this.needsUpdate) {
            this.needsUpdate = false
            let result = this.ownValue
            for (let source of this.sources.values()) result += source.getValue()
            this.value = result
        }
        return this.value
    }


    setValue(value: number) {
        this.ownValue = value
        this.setNeedsUpdate()
    }

    setNeedsUpdate() {
        this.needsUpdate = true
        for(let destination of this.destinations.values()) {
            destination.setNeedsUpdate()
        }
    }
}