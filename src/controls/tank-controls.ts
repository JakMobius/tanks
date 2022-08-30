import {BinaryEncodable} from '../serialization/binary/serializable';
import Axle from './axle';
import {Component} from "../utils/ecs/component";
import Entity from "../utils/ecs/entity";
import TransformComponent from "../entity/components/transform-component";
import WriteBuffer from "../serialization/binary/write-buffer";
import ReadBuffer from "../serialization/binary/read-buffer";
import HealthComponent from "../entity/components/health-component";

export default class TankControls implements BinaryEncodable, Component {
	public throttle = 0
	public steer = 0;
	public axles = new Map<string, Axle>();
	public primaryWeaponActive: boolean = false;
	public minerActive: boolean = false;
	public updated: boolean = false;
	public directional: boolean = false;
    public localControllers: number = 0
    public entity: Entity | null;

    constructor() {
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

        if (this.axles.get("primary-weapon").needsUpdate) return true
        return this.axles.get("miner").needsUpdate;
    }

    getThrottle() {
        if (this.axles.get("y").needsUpdate) {
            this.updateAxes()
        }
        return this.throttle
    }

    getSteer() {
        if (this.axles.get("x").needsUpdate) {
            this.updateAxes()
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
        let axle = this.getPrimaryWeaponAxle()

        if (axle.needsUpdate) {
            this.primaryWeaponActive = axle.getValue() > 0.5
        }

        return this.primaryWeaponActive
    }

    isMinerActive() {
        let axle = this.getMinerWeaponAxle()

        if (axle.needsUpdate) {
            this.minerActive = axle.getValue() > 0.5
        }

        return this.minerActive
    }

    updateAxes() {
        this.updated = true

        let health = this.entity.getComponent(HealthComponent).getHealth()
        if(health <= 0) {
            this.throttle = 0
            return
        }

        let x = this.axles.get("x").getValue()
        let y = this.axles.get("y").getValue()

        if (this.directional) {
            const transform = this.entity.getComponent(TransformComponent).transform

            this.steer = transform.transformX(x, y, 0)
            this.throttle = transform.transformY(x, y, 0)
        } else {
            this.throttle = y
            this.steer = x
        }
    }

    updateState(decoder: ReadBuffer): void {
        const xValue = Math.max(Math.min(decoder.readFloat32(), 1), -1)
        const yValue = Math.max(Math.min(decoder.readFloat32(), 1), -1)
        let weapons = decoder.readUint8()

        if(this.localControllers === 0) {
            this.axles.get("x").setValue(xValue)
            this.axles.get("y").setValue(yValue)
            this.axles.get("primary-weapon").setValue(weapons & 0b00000001)
            this.axles.get("miner").setValue(weapons & 0b00000010)
        }

        this.updateAxes()
    }

    toBinary(encoder: WriteBuffer): void {
        encoder.writeFloat32(this.axles.get("x").getValue())
        encoder.writeFloat32(this.axles.get("y").getValue())

        let weapons =
            (this.isPrimaryWeaponActive() as unknown as number & 1) << 0 |
            (this.isMinerActive() as unknown as number & 1) << 1

        encoder.writeUint8(weapons)
    }

    onAttach(entity: Entity) {
        this.entity = entity
    }

    onDetach() {
        this.entity = null
    }
}