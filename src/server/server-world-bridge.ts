import PlayerControlsPacket from "../networking/packets/game-packets/player-controls-packet";
import PlayerChatPacket from "../networking/packets/game-packets/player-chat-packet";
import PlayerRespawnPacket from "../networking/packets/game-packets/player-respawn-packet";
import ServerGameWorld from "./server-game-world";
import RoomPortal from "./room-portal";
import SocketPortalClient from "./socket/socket-portal-client";

export default class ServerWorldBridge {
    static buildBridge(world: ServerGameWorld, portal: RoomPortal) {
        portal.on(PlayerControlsPacket, (packet, client) => {
            client.emit(packet)
        })

        portal.on(PlayerRespawnPacket, (packet, client) => {
            client.emit(packet)
        })

        portal.on(PlayerChatPacket, (packet, client) => {
            client.emit(packet)
        })

        portal.on("client-disconnect", (client: SocketPortalClient) => {
            client.emit("disconnect")
        })
    }
}