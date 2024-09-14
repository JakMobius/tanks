import Axle from './axle';
import TransformComponent from "../entity/components/transform-component";
import HealthComponent from "../entity/components/health-component";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import {clamp} from "src/utils/utils";

export default class TankControls extends EventHandlerComponent {
	public throttle = 0
	public steer = 0;
	public axles = new Map<string, Axle>();
	public primaryWeaponActive: boolean = false;
	public minerActive: boolean = false;
	public updated: boolean = false;
	public directional: boolean = false;

    constructor() {
        super()
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

        let health = this.entity.getComponent(HealthComponent)
        if(health.getHealth() <= 0) return

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

        this.steer = clamp(this.steer, -1, 1)
        this.throttle = clamp(this.throttle, -1, 1)
    }
}