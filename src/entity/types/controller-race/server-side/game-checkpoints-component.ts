import HistoryManager from "src/client/map-editor/history/history-manager"
import ModificationGroup from "src/client/map-editor/history/modification-group"
import PropertyModification, { EntityProperty, PropertyInspector, VectorProperty } from "src/entity/components/inspector/property-inspector"
import Entity from "src/utils/ecs/entity"
import EventHandlerComponent from "src/utils/ecs/event-handler-component"
import ServerCheckpointComponent from "../../checkpoint/server-side/server-checkpoint-component"

export class RaceCheckpointsComponent extends EventHandlerComponent {
    checkpoints: Entity[] = []

    constructor() {
        super()

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            let spawnzoneCountProperty = new VectorProperty("checkpointCount", 1)
                .withName("Количество чекпоинтов")
                .withGetter(() => [this.checkpoints.length])
                .withSetter((count) => this.setCheckpointCount(count[0]))
                .withModificationCallback((historyManager: HistoryManager, entity: Entity, value: [number, number]) => {
                    let group = new ModificationGroup("Изменение количества чекпоинтов")

                    // When the spawnzone count is decreased, the checkpoints are cropped. This is irreversible.
                    // So in case user undo the operation, the cropped data should be restored.
                    if (this.checkpoints.length > value[0]) {
                        let startIndex = value[0]
                        let checkpoints = this.checkpoints.slice(startIndex)
                        group.add({
                            perform: () => { },
                            revert: () => {
                                for (let i = startIndex; i < this.checkpoints.length; i++) {
                                    this.setCheckpoint(i, checkpoints[i - startIndex])
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
                .updateOn("checkpoints-list-update")

            inspector.addProperty(spawnzoneCountProperty)

            for (let i = 0; i < this.checkpoints.length; i++) {
                inspector.addProperty(new EntityProperty(`checkpoints.${i}`)
                    .withName(`Чекпоинт ${i + 1}`)
                    .withGetter(() => this.checkpoints[i])
                    .withSetter((zone) => this.setCheckpoint(i, zone))
                    .updateOn("checkpoints-update"))
            }

            inspector.refreshOn("checkpoints-list-update")
        })
    }

    setCheckpoint(index: number, checkpoint: Entity) {
        this.checkpoints[index] = checkpoint
        this.checkpoints[index].getComponent(ServerCheckpointComponent).index = index
        this.entity.emit("checkpoints-update")
    }

    setCheckpointCount(count: number) {
        this.checkpoints.length = count
        this.entity.emit("checkpoints-list-update")
    }
}