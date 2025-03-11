
export default class WheelAxlesGenerator {
    axleWidth: number = 1
    axleOffsets: number[] = [0]

    setAxleWidth(width: number) {
        this.axleWidth = width
        return this
    }

    setAxles(axles: number, axleDistance: number, offset: number = 0) {
        let offsets = [];
        let axleY = -axleDistance * (axles - 1) / 2 + offset
        for (let axle = 0; axle < axles; axle++) {
            offsets.push(axleY)
            axleY += axleDistance
        }
        this.axleOffsets = offsets
        return this
    }

    setAxleOffsets(offsets: number[]) {
        this.axleOffsets = offsets
        return this
    }

    getWheelOffset(axle: number, side: number) {
        return {
            x: this.axleOffsets[axle],
            y: this.axleWidth / 2 * (side === 1 ? 1 : -1),
        }
    }
}