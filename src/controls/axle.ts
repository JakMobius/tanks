
export type Activator = (input: number) => number

export default class Axle {

    public static Activators = {
        linear: (input: number) => input,
        linearPositive: (input: number) => Math.max(0, input),
        linearNegative: (input: number) => -Math.max(0, input)
    }

	public sources = new Map<Axle, Activator>();
	public ownValue: number = 0;
	public value: number = 0;
	public destinations = new Set<Axle>();
	public needsUpdate: boolean = false;

    addSource(source: Axle, activator: Activator = Axle.Activators.linear) {
        this.sources.set(source, activator)
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
        this.setNeedsUpdate()
    }

    getValue() {
        if (this.needsUpdate) {
            this.needsUpdate = false
            let result = this.ownValue
            for (let [source, activator] of this.sources.entries()) {
                result += activator(source.getValue())
            }
            this.value = result
        }
        return this.value
    }


    setValue(value: number) {
        this.ownValue = value
        this.setNeedsUpdate()
        return this
    }

    setNeedsUpdate() {
        this.needsUpdate = true
        for(let destination of this.destinations.values()) {
            destination.setNeedsUpdate()
        }
    }
}