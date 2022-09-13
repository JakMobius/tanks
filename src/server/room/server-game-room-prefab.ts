import GameMap from "src/map/game-map";
import Loop from "src/utils/loop/loop";
import Entity from "src/utils/ecs/entity";
import {serverGameWorldEntityPrefab} from "../server-game-world";
import RoomLoopComponent from "./components/room-loop-component";
import HighPrecisionLoop from "src/utils/loop/high-precision-loop";
import WorldEventBroadcastComponent from "./components/world-event-broadcast-component";
import RoomClientComponent from "./components/room-client-component";
import EmptyServerPauseComponent from "./components/empty-server-pause-component";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import MapLoaderComponent from "./components/map-loader-component";


export interface GameConfig {
    name: string
    map: GameMap
    loop?: Loop
    tps?: number
}

export default function serverGameRoomPrefab(entity: Entity, options: GameConfig) {

    let tps = options.tps || 20

    entity.addComponent(new MapLoaderComponent(options.map))

    // Vital game components
    serverGameWorldEntityPrefab(entity, {
        map: entity.getComponent(MapLoaderComponent).getMap(),
    })

    let worldStatistics = entity.getComponent(WorldStatisticsComponent)
    worldStatistics.setMapName(options.name)

    entity.addComponent(new RoomLoopComponent(options.loop || new HighPrecisionLoop({
        interval: 1000 / tps,
        timeMultiplier: 0.001
    })))

    // Setup event monitoring and broadcasting
    entity.addComponent(new WorldEventBroadcastComponent())

    // Expose the room to the network
    entity.addComponent(new RoomClientComponent({
        name: options.name
    }))
    entity.addComponent(new EmptyServerPauseComponent())
}