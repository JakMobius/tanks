
import Rectangle from '../../utils/rectangle';

class SpawnZone extends Rectangle {
	public id: any;

    constructor(id) {
        super()
        this.id = id
    }

    static fromBinary(decoder) {
        let zone = new this(decoder.readUint8())
        zone.setFrom(decoder.readUint32(), decoder.readUint32())
        zone.setTo(decoder.readUint32(), decoder.readUint32())
        return zone
    }

    toBinary(encoder) {
        encoder.writeUint8(this.id)
        encoder.writeUint32(this.x1)
        encoder.writeUint32(this.y1)
        encoder.writeUint32(this.x2)
        encoder.writeUint32(this.y2)
    }
}

export default SpawnZone;