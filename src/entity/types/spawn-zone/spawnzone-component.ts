import { PropertyInspector, SelectProperty, VectorProperty } from "src/entity/components/inspector/property-inspector";
import { TransmitterSet } from "src/entity/components/network/transmitting/transmitter-set";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import TeamColor from "src/utils/team-color";
import SpawnzoneTransmitter from "./spawnzone-transmitter";
import TransformComponent from "src/entity/components/transform/transform-component";
import { degToRad, radToDeg } from "src/utils/utils";

export default class SpawnzoneComponent extends EventHandlerComponent {
    team = 0
    spawnAngle = 0

    constructor() {
        super()

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            let property = new SelectProperty("team")
                .withName("Команда")
                .withOptions(
                    TeamColor.teamNames.map((name, index) => ({
                        id: index, name
                    }))
                )
                .withGetter(() => String(this.team))
                .withSetter((team) => this.setTeam(Number(team)))
                .updateOn("team-set")
            inspector.addProperty(property)

            let angleProperty = new VectorProperty("spawnAngle", 1)
                .withName("Направление игроков при спавне")
                .replaceNaN()
                .withGetter(() => [radToDeg(this.spawnAngle)])
                .withSetter((angle) => this.setSpawnAngle(degToRad(angle[0])))
                .updateOn("spawn-angle-set")
            inspector.addProperty(angleProperty)
        })

        this.eventHandler.on("transmitter-set-added", (transmitterSet: TransmitterSet) => {
            transmitterSet.initializeTransmitter(SpawnzoneTransmitter)
        })
    }

    setTeam(team: number) {
        this.team = team
        this.entity.emit("team-set", team)
        return this
    }

    setSpawnAngle(angle: number) {
        this.spawnAngle = angle
        this.entity.emit("spawn-angle-set", angle)
        return this
    }

    getGlobalSpawnAngle() {
        return this.spawnAngle
    }

    sample() {
        let transform = this.entity.getComponent(TransformComponent).getGlobalTransform()

        let x = Math.random() * 2 - 1
        let y = Math.random() * 2 - 1

        return {
            x: transform.transformX(x, y),
            y: transform.transformY(x, y)
        }
    }

    center() {
        let transform = this.entity.getComponent(TransformComponent).getGlobalTransform()

        return {
            x: transform.transformX(0, 0),
            y: transform.transformY(0, 0)
        }
    }
}