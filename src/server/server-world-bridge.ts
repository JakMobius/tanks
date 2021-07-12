import PlayerControlsPacket from "../networking/packets/game-packets/playercontrolspacket";
import PlayerConfigPacket from "../networking/packets/game-packets/playerconfigpacket";
import PlayerChatPacket from "../networking/packets/game-packets/playerchatpacket";
import Player from "../utils/player";
import ServerTank from "./tanks/servertank";
import PlayerRespawnPacket from "../networking/packets/game-packets/playerrespawnpacket";
import ServerEntity from "./entity/serverentity";
import EntityCreatePacket from "../networking/packets/game-packets/entitycreatepacket";
import EntityRemovePacket from "../networking/packets/game-packets/entityremovepacket";
import ServerEffect from "./effects/servereffect";
import EffectCreatePacket from "../networking/packets/game-packets/effectcreatepacket";
import EffectRemovePacket from "../networking/packets/game-packets/effectremovepacket";
import BlockUpdatePacket from "../networking/packets/game-packets/blockupdatepacket";
import ServerGameWorld from "./servergameworld";
import RoomPortal from "./room-portal";
import SocketPortalClient from "./socket/socket-portal-client";
import PlayerJoinPacket from "../networking/packets/game-packets/playerjoinpacket";
import PlayerSpawnPacket from "../networking/packets/game-packets/playerspawnpacket";
import PlayerLeavePacket from "../networking/packets/game-packets/playerleavepacket";
import MapPacket from "../networking/packets/game-packets/mappacket";

export default class ServerWorldBridge {
    static buildBridge(world: ServerGameWorld, portal: RoomPortal) {
        portal.on(PlayerControlsPacket, (packet, client) => {
            if(client.data.player) {
                packet.updateControls(client.data.player.tank.model.controls)
            }
        })

        portal.on(PlayerConfigPacket, (packet, client) => {
            if(!packet.tank) return
            world.emit("player-choose-tank", client, packet.tank, packet.nick)
        })

        portal.on(PlayerRespawnPacket, (packet, client) => {
            if (!client.data.player) return
            world.emit("player-respawn", client)
        })

        portal.on(PlayerChatPacket, (packet, client) => {
            const id = client.id

            if (id === undefined) return
            world.emit("player-chat", client.data.player, packet.text)
        })

        portal.on("client-connect", (client) => {
            new MapPacket(world.map).sendTo(client.connection)
            this.broadcastPlayers(client, portal)
            new EntityCreatePacket(Array.from(world.entities.values())).sendTo(client.connection)
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

        world.on("player-remove", (player: Player) => {
            portal.broadcast(new PlayerLeavePacket(player))
            portal.broadcast(new PlayerChatPacket("§!F00;" + player.nick + "§!; вышел из игры"))
        })

        // TODO: Batch block update packets

        world.map.on("block-update", (x: number, y: number) => {
            portal.broadcast(new BlockUpdatePacket(x, y, world.map.getBlock(x, y)))
        })
    }

    private static sendPlayerJoinEvent(clients: Iterable<SocketPortalClient>, player: Player) {

        let joinPacket: PlayerJoinPacket | null = null

        for (let client of clients) {
            if (client.data.player != null && client.data.player.id === player.id) {
                let packet = new PlayerSpawnPacket(player, player.tank.model)

                packet.sendTo(client.connection)
            } else {
                if(!joinPacket) {
                    joinPacket = new PlayerJoinPacket(player, player.tank.model)
                }

                joinPacket.sendTo(client.connection)
            }
        }
    }

    private static broadcastPlayers(client: SocketPortalClient, portal: RoomPortal): void {
        for (let other of portal.clients.values()) {
            if(other.data.player) {
                new PlayerJoinPacket(other.data.player, other.data.player.tank.model).sendTo(client.connection)
            }
        }
    }
}