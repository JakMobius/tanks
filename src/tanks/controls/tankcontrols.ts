import BinarySerializable, {BinaryEncodable} from '../../serialization/binary/serializable';
import Axle from './axle';
import BinaryDecoder from "../../serialization/binary/binarydecoder";
import BinaryEncoder from 'src/serialization/binary/binaryencoder';
import RotationalMatrix from 'src/utils/rotationalmatrix';
import TankModel from "../tankmodel";

class TankControls implements BinaryEncodable {
	public tank: TankModel | undefined;
	public throttle = 0
	public steer = 0;
	public axles = new Map<string, Axle>();
	public primaryWeaponActive: boolean = false;
	public minerActive: boolean = false;
	public updated: boolean = false;
	public directional: boolean = true;
	public matrix: RotationalMatrix | null = null;

    constructor(tank?: TankModel) {
        this.tank = tank

        this.axles.set("x", new Axle())
        this.axles.set("y", new Axle())
        this.axles.set("primary-weapon", new Axle())
        this.axles.set("miner", new Axle())
    }

    shouldUpdate() {
        if (this.updated) {
            this.updated = false
            return true
        }

        if (this.axles.get("primary-weapon").needsUpdate()) return true
        return !!this.axles.get("miner").needsUpdate();
    }

    getThrottle() {
        if (this.tank.health <= 0) {
            return 0
        }

        if (this.axles.get("y").needsUpdate()) {
            this.updateAxises()
        }
        return this.throttle
    }

    getSteer() {
        if (this.tank.health <= 0) {
            return 0
        }

        if (this.axles.get("x").needsUpdate()) {
            this.updateAxises()
        }
        return this.steer
    }

    getPrimaryWeaponAxle() {
        return this.axles.get("primary-weapon")
    }

    getMinerWeaponAxle() {
        return this.axles.get("miner")
    }

    isPrimaryWeaponActive() {
        if (this.tank.health <= 0) {
            return false
        }

        let axle = this.getPrimaryWeaponAxle()

        if (axle.needsUpdate()) {
            this.primaryWeaponActive = axle.getValue() > 0.5
        }

        return this.primaryWeaponActive
    }

    isMinerActive() {
        if (this.tank.health <= 0) {
            return false
        }

        let axle = this.getMinerWeaponAxle()

        if (axle.needsUpdate()) {
            this.minerActive = axle.getValue() > 0.5
        }

        return this.minerActive
    }

    updateAxises() {
        let x = this.axles.get("x").getValue()
        let y = this.axles.get("y").getValue()

        this.updated = true

        if (this.matrix && this.directional) {
            this.steer = this.matrix.turnHorizontalAxis(x, y)
            this.throttle = this.matrix.turnVerticalAxis(x, y)
        } else {
            this.throttle = y
            this.steer = x
        }
    }

    updateState(decoder: BinaryDecoder): void {
        this.axles.get("x").setValue(Math.max(Math.min(decoder.readFloat32(), 1), -1))
        this.axles.get("y").setValue(Math.max(Math.min(decoder.readFloat32(), 1), -1))
        let weapons = decoder.readUint8()

        this.axles.get("primary-weapon").setValue(weapons & 0b00000001)
        this.axles.get("miner").setValue(weapons & 0b00000010)

        this.updateAxises()
    }

    toBinary(encoder: BinaryEncoder): void {
        encoder.writeFloat32(this.axles.get("x").getValue())
        encoder.writeFloat32(this.axles.get("y").getValue())

        let weapons =
            (this.isPrimaryWeaponActive() as unknown as number & 1) << 0 |
            (this.isMinerActive() as unknown as number & 1) << 1

        encoder.writeUint8(weapons)
    }
}

export default TankControls;