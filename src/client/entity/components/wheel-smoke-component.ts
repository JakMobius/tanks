import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TankWheelsComponent from "src/entity/components/tank-wheels-component";
import ParticleHostComponent from "src/client/entity/components/particle-host-component";
import Color from "src/utils/color";
import {Wheel} from "src/entity/components/transmission/units/wheel-group";
import TransformComponent from "src/entity/components/transform/transform-component";
import WheelSmokeParticle from "src/client/particles/wheel-smoke-particle";

export default class WheelSmokeComponent extends EventHandlerComponent {

    minSlideVelocity = 7
    maxSlideVelocity = 14

    wheelSmokeDelays: number[][] = []
    minSmokeDelay = 0.05

    constructor() {
        super();

        this.eventHandler.on("tick", (dt) => this.onTick(dt))
    }

    private onTick(dt: number) {
        const wheelGroups = this.entity.getComponent(TankWheelsComponent).getWheelGroups()

        if (this.wheelSmokeDelays.length !== wheelGroups.length) {
            this.wheelSmokeDelays = new Array(wheelGroups.length)
        }

        for (let i = 0; i < wheelGroups.length; i++) {
            const wheelGroup = wheelGroups[i];

            if (this.wheelSmokeDelays[i]?.length !== wheelGroup.wheels.length) {
                this.wheelSmokeDelays[i] = new Array(wheelGroup.wheels.length).fill(0)
            }

            for (let j = 0; j < wheelGroup.wheels.length; j++) {
                const wheel = wheelGroup.wheels[j];
                let delay = this.wheelSmokeDelays[i][j]

                const slideVelocity = wheel.slideVelocity
                let normalizedSlideVelocity = (slideVelocity - this.minSlideVelocity) / (this.maxSlideVelocity - this.minSlideVelocity)
                if (normalizedSlideVelocity < 0) {
                    continue
                }

                if (normalizedSlideVelocity > 1) {
                    normalizedSlideVelocity = 1
                }

                delay -= dt * normalizedSlideVelocity

                if (delay <= 0) {
                    delay = this.minSmokeDelay
                    this.emitWheelSmoke(wheel, normalizedSlideVelocity)
                }

                this.wheelSmokeDelays[i][j] = delay
            }
        }
    }

    emitWheelSmoke(wheel: Wheel, intensity: number) {
        const transformComponent = this.entity.getComponent(TransformComponent)
        const particleComponent = this.entity.parent.getComponent(ParticleHostComponent)

        let transform = transformComponent.getTransform()

        const color = new Color().setRGB(0.9, 0.9, 0.9, intensity)

        const smoke = new WheelSmokeParticle({
            x: transform.transformX(wheel.x, wheel.y) + Math.random() - 0.5,
            y: transform.transformY(wheel.x, wheel.y) + Math.random() - 0.5,
            dx: 0,
            dy: 0,
            width: 0.5,
            height: 0.5,
            scaling: 1.5,
            color: color
        })

        particleComponent.addParticle(smoke)
    }
}
