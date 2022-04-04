
import PlayerControlsPacket from "../networking/packets/game-packets/player-controls-packet";
import PlayerConfigPacket from "../networking/packets/game-packets/player-config-packet";
import PlayerChatPacket from "../networking/packets/game-packets/player-chat-packet";
import PlayerRespawnPacket from "../networking/packets/game-packets/player-respawn-packet";
import EntityCreatePacket from "../networking/packets/game-packets/entity-create-packet";
import EntityRemovePacket from "../networking/packets/game-packets/entity-remove-packet";
import EffectCreatePacket from "../networking/packets/game-packets/effect-create-packet";
import EffectRemovePacket from "../networking/packets/game-packets/effect-remove-packet";
import BlockUpdatePacket from "../networking/packets/game-packets/block-update-packet";
import PlayerJoinPacket from "../networking/packets/game-packets/player-join-packet";
import PlayerLeavePacket from "../networking/packets/game-packets/player-leave-packet";
import MapPacket from "../networking/packets/game-packets/map-packet";
import ServerEntity from "./entity/server-entity";
import ServerEffect from "./effects/server-effect";
import ServerGameWorld from "./server-game-world";
import RoomPortal from "./room-portal";
import ServerPlayer from "./server-player";
import EntityLocationPacket from "../networking/packets/game-packets/entity-location-packet";
import PlayerSpawnPacket from "../networking/packets/game-packets/player-spawn-packet";
import WorldPlayerControlsPacket from "../networking/packets/game-packets/world-player-controls-packet";
import {TwoDimensionalMap} from "../utils/two-dimensional-map";
import EntityHealthPacket from "../networking/packets/game-packets/entity-health-packet";
import {GameSocketPortalClient} from "./socket/game-server/game-socket-portal";
import TilemapComponent from "../physics/tilemap-component";

export default class ServerWorldBridge {
    static buildBridge(world: ServerGameWorld, portal: RoomPortal) {
        portal.on(PlayerControlsPacket, (packet, client) => {
            const player = client.data.player
            if(!player) return
            packet.updateControls(player.tank.model.controls)
        })

        portal.on(PlayerConfigPacket, (packet, client) => {
            if(!packet.tank) return
            world.emit("player-config", client, packet.tank, packet.nick)
        })

        portal.on(PlayerRespawnPacket, (packet, client) => {
            if (!client.data.player) return
            world.emit("player-respawn", client.data.player)
        })

        portal.on(PlayerChatPacket, (packet, client) => {
            if(!client.data.player) return
            world.emit("player-chat", client.data.player, packet.text)
        })

        portal.on("client-connect", (client: GameSocketPortalClient) => {
            new MapPacket(world.getComponent(TilemapComponent).map).sendTo(client.connection)
            new EntityCreatePacket(Array.from(world.entities.values())).sendTo(client.connection)
            this.broadcastPlayers(client, portal)
        })

        portal.on("client-disconnect", (client: GameSocketPortalClient) => {
            const player = client.data.player
            if(player) {
                client.data.player = null
                world.removePlayer(player)
                if(player.tank) world.removeEntity(player.tank)
            }
        })

        world.on("entity-create", (entity: ServerEntity) => {
            portal.broadcast(new EntityCreatePacket(entity))
        })

        world.on("entity-remove", (entity: ServerEntity) => {
            portal.broadcast(new EntityRemovePacket(entity))
        })

        world.on("effect-create", (effect: ServerEffect) => {
            portal.broadcast(new EffectCreatePacket(effect.model))
        })

        world.on("effect-remove", (effect: ServerEffect) => {
            if((effect.constructor as typeof ServerEffect).shouldSynchroniseRemoval)
                portal.broadcast(new EffectRemovePacket(effect.model.id))
        })

        world.on("player-create", (player: ServerPlayer) => {
            this.sendPlayerJoinEvent(portal.clients.values(), player)
        })

        world.on("player-changed-tank", (player: ServerPlayer) => {
            this.sendPlayerJoinEvent(portal.clients.values(), player)
        })

        world.on("player-remove", (player: ServerPlayer) => {
            portal.broadcast(new PlayerLeavePacket(player))
        })

        world.on("tick", () => {
            portal.broadcast(new EntityLocationPacket(world))
            portal.broadcast(new WorldPlayerControlsPacket(world))
        })

        this.setupBlockUpdates(world, portal)
        this.setupEntityHealthUpdates(world, portal)
    }

    private static sendPlayerJoinEvent(clients: Iterable<GameSocketPortalClient>, player: ServerPlayer) {

        let spawnPacket = new PlayerSpawnPacket(player.nick, player.id, player.tank.model.id)
        let joinPacket = new PlayerJoinPacket(player.nick, player.id, player.tank.model.id)

        for (let client of clients) {
            if (client.data.player != null && client.data.player === player) {
                spawnPacket.sendTo(client.connection)
            } else {
                joinPacket.sendTo(client.connection)
            }
        }
    }

    private static broadcastPlayers(client: GameSocketPortalClient, portal: RoomPortal): void {
        for (let other of portal.clients.values()) {
            if(other.data.player) {
                let otherPlayer = other.data.player
                new PlayerJoinPacket(otherPlayer.nick, otherPlayer.id, otherPlayer.tank.model.id).sendTo(client.connection)
            }
        }
    }

    private static setupBlockUpdates(world: ServerGameWorld, portal: RoomPortal) {
        const blockUpdateMap = new TwoDimensionalMap<number, number, boolean>()

        world.on("map-block-change", (x: number, y: number) => {
            blockUpdateMap.set(x, y, true)
        })

        world.on("map-block-damage", (x: number, y: number) => {
            blockUpdateMap.set(x, y, true)
        })

        world.on("tick", () => {
            const map = world.getComponent(TilemapComponent).map
            for(let [x, row] of blockUpdateMap.rows.entries()) {
                for(let y of row.keys()) {
                    portal.broadcast(new BlockUpdatePacket(x, y, map.getBlock(x, y)))
                }
            }

            blockUpdateMap.clear()
        })
    }

    private static setupEntityHealthUpdates(world: ServerGameWorld, portal: RoomPortal) {
        const healthUpdatedEntities = new Set<ServerEntity>()

        world.on("entity-health-change", (entity: ServerEntity) => {
            healthUpdatedEntities.add(entity)
        })

        world.on("tick", () => {
            if(healthUpdatedEntities.size) {
                portal.broadcast(new EntityHealthPacket(healthUpdatedEntities))
                healthUpdatedEntities.clear()
            }
        })
    }
}