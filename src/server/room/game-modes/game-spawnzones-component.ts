import HistoryManager from "src/client/map-editor/history/history-manager";
import ModificationGroup from "src/client/map-editor/history/modification-group";
import PropertyModification, { EntityProperty, PropertyInspector, VectorProperty } from "src/entity/components/inspector/property-inspector";
import Entity from "src/utils/ecs/entity";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class GameSpawnzonesComponent extends EventHandlerComponent {
    spawnzones: Entity[] = []
    
    constructor() {
        super()

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            let spawnzoneCountProperty = new VectorProperty("spawnzoneCount", 1)
                .withName("Количество зон спавна")
                .withGetter(() => [this.spawnzones.length])
                .withSetter((count) => this.setSpawnzoneCount(count[0]))
                .withModificationCallback((historyManager: HistoryManager, entity: Entity, value: [number, number]) => {
                    let group = new ModificationGroup("Изменение количества зон спавна")

                    // When the spawnzone count is decreased, the spawnzones are cropped. This is irreversible.
                    // So in case user undo the operation, the cropped data should be restored.
                    if(this.spawnzones.length > value[0]) {
                        let startIndex = value[0]
                        let spawnzones = this.spawnzones.slice(startIndex)
                        group.add({
                            perform: () => {},
                            revert: () => {
                                for(let i = startIndex; i < this.spawnzones.length; i++) {
                                    this.setSpawnzone(i, spawnzones[i - startIndex])
                                }
                            }
                        })
                    }

                    group.add(new PropertyModification(entity, spawnzoneCountProperty, value))
                    historyManager.registerModification(group)
                })
                .replaceNaN()
                .requirePositive()
                .requireInteger()
                .setBounds(0, 32)
                .updateOn("spawnzones-list-update")
            
            inspector.addProperty(spawnzoneCountProperty)

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