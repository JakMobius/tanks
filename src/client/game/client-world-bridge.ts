import ConnectionClient from "../../networking/connection-client";
import MapPacket from "../../networking/packets/game-packets/map-packet";
import PlayerJoinPacket from "../../networking/packets/game-packets/player-join-packet";
import PlayerSpawnPacket from "../../networking/packets/game-packets/player-spawn-packet";
import EntityCreatePacket from "../../networking/packets/game-packets/entity-create-packet";
import ClientEntity from "../entity/client-entity";
import EntityRemovePacket from "../../networking/packets/game-packets/entity-remove-packet";
import PlayerLeavePacket from "../../networking/packets/game-packets/player-leave-packet";
import ClientGameWorld from "../client-game-world";
import ClientPlayer from "../client-player";
import ClientTank from "../entity/tank/client-tank";
import WorldPlayerControlsPacket from "../../networking/packets/game-packets/world-player-controls-packet";
import TilemapComponent from "../../physics/tilemap-component";

export default class ClientWorldBridge {
    static buildBridge(client: ConnectionClient, world: ClientGameWorld) {
        client.on(MapPacket, (packet) => {
            world.getComponent(TilemapComponent).setMap(packet.map)
        })

        client.on(PlayerJoinPacket, (packet) => {
            this.createPlayer(world, packet.nick, packet.id, packet.tankId)
        })

        client.on(PlayerSpawnPacket, (packet) => {
            let player = this.createPlayer(world, packet.nick, packet.id, packet.tankId)
            world.setPrimaryPlayer(player)
        })

        client.on(EntityCreatePacket, (packet) => {
            packet.createEntities((model) => {
                let entity = ClientEntity.fromModel(model)
                world.createEntity(entity)
                return entity
            })
        })

        client.on(EntityRemovePacket, (packet) => {
            packet.updateEntities(world)
        })

        client.on(WorldPlayerControlsPacket, (packet) => {
            packet.updateControls(world)
        })

        client.on(PlayerLeavePacket, (packet) => {
            const player = world.players.get(packet.playerId)
            world.removePlayer(player)
        })
    }

    private static createPlayer(world: ClientGameWorld, nick: string, id: number, tankId: number) {
        let tank = world.entities.get(tankId) as ClientTank

        let player: ClientPlayer = world.players.get(id)

        if(!player) {
            player = new ClientPlayer({
                id: id,
                nick: nick,
                tank: tank
            })
        } else {
            player.setTank(tank)
        }

        world.createPlayer(player)
        return player
    }
}