import PlayerControlsPacket from "../networking/packets/game-packets/player-controls-packet";
import PlayerChatPacket from "../networking/packets/game-packets/player-chat-packet";
import PlayerActionPacket from "src/networking/packets/game-packets/player-action-packet";
import RoomPortal from "./room-portal";
import SocketPortalClient from "./socket/socket-portal-client";
import Entity from "../utils/ecs/entity";
import PlayerTankSelectPacket from "src/networking/packets/game-packets/player-tank-select-packet";

export default class ServerWorldBridge {
    static buildBridge(world: Entity, portal: RoomPortal) {
        portal.on(PlayerControlsPacket, (packet, client) => {
            client.emit(packet)
        })

        portal.on(PlayerActionPacket, (packet, client) => {
            client.emit(packet)
        })

        portal.on(PlayerTankSelectPacket, (packet, client) => {
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