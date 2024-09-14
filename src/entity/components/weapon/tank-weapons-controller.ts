import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class TankWeaponsController extends EventHandlerComponent {
    weapons: Entity[] = []

    constructor() {
        super()
        this.eventHandler.on("weapon-attach", (weapon) => {
            this.weapons.push(weapon)
        })

        this.eventHandler.on("weapon-detach", (weapon) => {
            let index = this.weapons.indexOf(weapon)
            if (index !== -1) {
                this.weapons.splice(index, 1)
            }
        })
    }
}