import BlockState from "./block-state/block-state"
import { SpawnZone } from "./spawnzones-component"

export interface SpawnZoneConfig {
    id: number
    x1: number
    y1: number
    x2: number
    y2: number
}

export interface MapFile {
    signature: "TNKS",
    version: string,
    name: string,
    width: number,
    height: number,
    spawnZones: SpawnZoneConfig[],
    blocks: string
}

export class MalformedMapFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MalformedMapFileError";
    }
}

export function idToChar(id: number) {
    if(id > 26) throw new Error("ID is too large!")
    if(id === 0) return '-'
    return String.fromCharCode('a'.charCodeAt(0) + id - 1)
}

export function charToId(char: string) {
    if(char === '-') return 0
    return char.charCodeAt(0) - 'a'.charCodeAt(0) + 1
}

export function readMapFile(json: MapFile) {
    if(json.signature !== "TNKS") {
        throw new MalformedMapFileError("Invalid map file signature")
    }
    
    if(json.version !== "0.0.1") {
        throw new MalformedMapFileError("Unsupported map file version: " + json.version)
    }

    let width = json.width
    let height = json.height
    let blocks: BlockState[] = []

    let blockCount = width * height
    for(let i = 0; i < blockCount; i++) {
        let id = charToId(json.blocks[i])
        let Block = BlockState.getBlockStateClass(id)
        blocks.push(new Block())
    }

    let spawnZones: SpawnZone[] = []
    for(let spawnZone of json.spawnZones) {
        let zone = new SpawnZone(spawnZone.id)
        zone.setFrom(spawnZone.x1, spawnZone.y1)
        zone.setTo(spawnZone.x2, spawnZone.y2)
        spawnZones.push(zone)
    }

    let name = json.name ?? null

    return { width, height, blocks, spawnZones, name }
}