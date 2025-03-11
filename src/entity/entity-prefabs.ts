import Entity from "../utils/ecs/entity";

export enum EntityType {
    tank,
    gameController,
    other
}

export interface EntityMetadata {
    type?: EntityType
    displayName?: string
    [key: string]: any
}

export interface EntityPrefabConfig {
    id: string
    type?: EntityType
    prefab: (entity: Entity) => void
    metadata?: Record<string, any>
}

export class EntityPrefab {
    id: string
    prefab: (entity: Entity) => void
    metadata: EntityMetadata

    constructor(config: EntityPrefabConfig) {
        this.id = config.id
        this.prefab = config.prefab
        this.metadata = config.metadata ?? {}
    }

    getDisplayName() {
        return this.metadata.displayName ?? this.id
    }
}

export default class EntityPrefabs {
    static Types = new Map<number, (entity: Entity) => void>()
}