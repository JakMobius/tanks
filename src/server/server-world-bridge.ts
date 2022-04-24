import PlayerControlsPacket from "../networking/packets/game-packets/player-controls-packet";
import PlayerConfigPacket from "../networking/packets/game-packets/player-config-packet";
import PlayerChatPacket from "../networking/packets/game-packets/player-chat-packet";
import PlayerRespawnPacket from "../networking/packets/game-packets/player-respawn-packet";
import ServerGameWorld from "./server-game-world";
import RoomPortal from "./room-portal";
import {GameSocketPortalClient} from "./socket/game-server/game-socket-portal";
import TankControls from "../controls/tank-controls";

export default class ServerWorldBridge {
    static buildBridge(world: ServerGameWorld, portal: RoomPortal) {
        portal.on(PlayerControlsPacket, (packet, client) => {
            const player = client.data.player
            if(!player) return
            packet.updateControls(player.tank.getComponent(TankControls))
        })

        portal.on(PlayerConfigPacket, (packet, client) => {
            world.emit("player-config", client, packet.modelId, packet.nick)
        })

        portal.on(PlayerRespawnPacket, (packet, client) => {
            if (!client.data.player) return
            world.emit("player-respawn", client.data.player)
        })

        portal.on(PlayerChatPacket, (packet, client) => {
            if(!client.data.player) return
            world.emit("player-chat", client.data.player, packet.text)
        })

        portal.on("client-disconnect", (client: GameSocketPortalClient) => {
            const player = client.data.player
            if(player) {
                client.data.player = null
                world.removePlayer(player)
                if(player.tank) player.tank.die()
            }
        })
    }
}