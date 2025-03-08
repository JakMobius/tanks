import { EntityProperty, PropertyInspector, VectorProperty } from "src/entity/components/inspector/property-inspector";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class GameSpawnzonesComponent extends EventHandlerComponent {
    spawnzones: Entity[] = []
    
    constructor() {
        super()

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            inspector.addProperty(new VectorProperty("spawnzoneCount", 1)
                .withName("Количество зон спавна")
                .withGetter(() => [this.spawnzones.length])
                .withSetter((count) => this.setSpawnzoneCount(count[0]))
                .replaceNaN()
                .requirePositive()
                .requireInteger()
                .setBounds(0, 32)
                .updateOn("spawnzones-list-update")
            )

            for(let i = 0; i < this.spawnzones.length; i++) {
                inspector.addProperty(new EntityProperty(`spawnzones.${i}`)
                    .withName(`Зона ${i + 1}`)
                    .withGetter(() => this.spawnzones[i])
                    .withSetter((zone) => this.setSpawnzone(i, zone))
                    .updateOn("spawnzones-update"))
            }

            inspector.refreshOn("spawnzones-list-update")
        })
    }

    setSpawnzone(index: number, zone: Entity) {
        this.spawnzones[index] = zone
        this.entity.emit("spawnzones-update")
    }

    setSpawnzoneCount(count: number) {
        this.spawnzones.length = count
        this.entity.emit("spawnzones-list-update")
    }
}