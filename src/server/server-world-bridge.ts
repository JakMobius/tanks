import PlayerControlsPacket from "../networking/packets/game-packets/player-controls-packet";
import PlayerConfigPacket from "../networking/packets/game-packets/player-config-packet";
import PlayerChatPacket from "../networking/packets/game-packets/player-chat-packet";
import PlayerRespawnPacket from "../networking/packets/game-packets/player-respawn-packet";
import EntityCreatePacket from "../networking/packets/game-packets/entity-create-packet";
import EntityRemovePacket from "../networking/packets/game-packets/entity-remove-packet";
import PlayerJoinPacket from "../networking/packets/game-packets/player-join-packet";
import PlayerLeavePacket from "../networking/packets/game-packets/player-leave-packet";
import ServerEntity from "./entity/server-entity";
import ServerGameWorld from "./server-game-world";
import RoomPortal from "./room-portal";
import ServerPlayer from "./server-player";
import PlayerSpawnPacket from "../networking/packets/game-packets/player-spawn-packet";
import WorldPlayerControlsPacket from "../networking/packets/game-packets/world-player-controls-packet";
import {GameSocketPortalClient} from "./socket/game-server/game-socket-portal";
import TankControls from "../controls/tank-controls";

export default class ServerWorldBridge {
    static buildBridge(world: ServerGameWorld, portal: RoomPortal) {
        portal.on(PlayerControlsPacket, (packet, client) => {
            const player = client.data.player
            if(!player) return
            packet.updateControls(player.tank.model.getComponent(TankControls))
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
            portal.broadcast(new WorldPlayerControlsPacket(world))
        })
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
}