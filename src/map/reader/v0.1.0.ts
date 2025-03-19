import { EntityDeserializer, PrefabFilter, SerializedEntity } from "src/entity/components/inspector/entity-serializer"
import { MapFile } from "../map-serialization"

type NewType = SerializedEntity

export interface MapFileV0_1_0 extends MapFile {
    root: NewType
    danglingEntities: SerializedEntity[]
}

export function readMapV0_1_0(file: MapFileV0_1_0) {
    let config = file as MapFileV0_1_0
    let name = config.name ?? null

    return { name, createEntity: (factory: PrefabFilter) => {
        let ctx = new EntityDeserializer(factory)

        if(config.danglingEntities) {
            for(let entity of config.danglingEntities) {
                ctx.createTreeFor(entity, false)
            }
        }

        let entity = ctx.createTreeFor(config.root)
        ctx.restoreProperties()

        return entity
    }}
}