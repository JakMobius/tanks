import Version from "src/utils/version"
import Entity from "src/utils/ecs/entity"
import { PrefabFilter, EntitySerializer } from "src/entity/components/inspector/entity-serializer"
import { MapFileV0_0_1, readMapV0_0_1 } from "./reader/v0.0.1"
import { MapFileV0_1_0, readMapV0_1_0 } from "./reader/v0.1.0"

export interface MapFile {
    signature: "TNKS",
    version: string,
    name: string,
}

export class MalformedMapFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MalformedMapFileError";
    }
}

export interface PackedEntity {
    name: string
    createEntity: (factory?: PrefabFilter) => Entity
}

export function readEntityFile(file: MapFile) {
    if(file.signature !== "TNKS") {
        throw new MalformedMapFileError("Invalid map file signature")
    }
    
    let version = new Version(file.version)
    
    if(version.compare(new Version("0.0.1")) === 0) {
        return readMapV0_0_1(file as MapFileV0_0_1)
    }

    if(version.compare(new Version("0.1.0")) === 0) {
        return readMapV0_1_0(file as MapFileV0_1_0)
    }

    throw new MalformedMapFileError("Unsupported map file version: " + file.version)
}

export function writeEntityFile(entity: Entity, name: string): MapFileV0_1_0 {
    let serializer = new EntitySerializer()
    let root = serializer.serializeTree(entity)
    let danglingEntities = serializer.getSerializedDanglingEntities()
    return {
        signature: "TNKS",
        version: "0.1.0",
        name, root, danglingEntities
    }
}