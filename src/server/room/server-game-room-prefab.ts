import Loop from "src/utils/loop/loop";
import Entity from "src/utils/ecs/entity";
import {serverGameWorldEntityPrefab} from "src/server/entity/server-game-world";
import RoomLoopComponent from "./components/room-loop-component";
import HighPrecisionLoop from "src/utils/loop/high-precision-loop";
import WorldEventBroadcastComponent from "./components/world-event-broadcast-component";
import RoomClientComponent from "./components/room-client-component";
import EmptyServerPauseComponent from "./components/empty-server-pause-component";
import WorldStatisticsComponent from "src/entity/components/world-statistics/world-statistics-component";
import GameSocketPortal from "src/server/socket/game-server/game-socket-portal";
import RoomSocketComponent from "src/server/room/components/room-socket-component";


export interface GameConfig {
    name: string
    mode?: string
    loop?: Loop
    tps?: number
    gameSocket?: GameSocketPortal
}

export default function serverGameRoomPrefab(entity: Entity, options: GameConfig) {

    let tps = options.tps || 20

    // Vital game components
    serverGameWorldEntityPrefab(entity)

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
        name: options.name,
        mode: options.mode
    }))

    if(options.gameSocket) {
        entity.addComponent(new RoomSocketComponent(options.gameSocket))
    }

    entity.addComponent(new EmptyServerPauseComponent())
}