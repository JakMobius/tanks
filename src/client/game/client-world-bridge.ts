import ConnectionClient from "../../networking/connection-client";
import MapPacket from "../../networking/packets/game-packets/map-packet";
import PlayerJoinPacket from "../../networking/packets/game-packets/player-join-packet";
import PlayerSpawnPacket from "../../networking/packets/game-packets/player-spawn-packet";
import EntityLocationPacket from "../../networking/packets/game-packets/entity-location-packet";
import EntityCreatePacket from "../../networking/packets/game-packets/entity-create-packet";
import ClientEntity from "../entity/client-entity";
import EntityRemovePacket from "../../networking/packets/game-packets/entity-remove-packet";
import BlockUpdatePacket from "../../networking/packets/game-packets/block-update-packet";
import PlayerLeavePacket from "../../networking/packets/game-packets/player-leave-packet";
import EffectCreatePacket from "../../networking/packets/game-packets/effect-create-packet";
import TankEffectModel from "../../effects/tank/tank-effect-model";
import ClientTankEffect from "../effects/tank/client-tank-effect";
import WorldEffectModel from "../../effects/world/world-effect-model";
import ClientWorldEffect from "../effects/world/client-world-effect";
import EffectRemovePacket from "../../networking/packets/game-packets/effect-remove-packet";
import ClientGameWorld from "../client-game-world";
import ClientPlayer from "../client-player";
import ClientTank from "../entity/tank/client-tank";
import WorldPlayerControlsPacket from "../../networking/packets/game-packets/world-player-controls-packet";
import EntityHealthPacket from "../../networking/packets/game-packets/entity-health-packet";
import TilemapComponent from "../../physics/tilemap-component";
import EffectHost from "../../effects/effect-host";
import AbstractEffect from "../../effects/abstract-effect";

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

        client.on(EntityLocationPacket, (packet) => {
            packet.updateEntities(world)
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

        client.on(EntityHealthPacket, (packet) => {
            packet.updateEntities(world)
        })

        client.on(BlockUpdatePacket, (packet) => {
            world.getComponent(TilemapComponent).map.setBlock(packet.x, packet.y, packet.block)
        })

        client.on(WorldPlayerControlsPacket, (packet) => {
            packet.updateControls(world)
        })

        client.on(PlayerLeavePacket, (packet) => {
            const player = world.players.get(packet.playerId)
            world.removePlayer(player)
        })

        // TODO: bad.
        let effects = new Map<number, AbstractEffect>()

        client.on(EffectCreatePacket, (packet) => {
            let effect = packet.effect

            if(effect instanceof TankEffectModel) {
                let player = world.players.get(effect.tankId)
                const tank = player.tank
                if (!player || !tank) return

                let wrapper = ClientTankEffect.fromModelAndTank(effect, tank)
                tank.model.getComponent(EffectHost).addEffect(wrapper)
                effects.set(effect.id, wrapper)
            } else if(effect instanceof WorldEffectModel) {
                let wrapper = ClientWorldEffect.fromModelAndWorld(effect, world)
                world.getComponent(EffectHost).addEffect(wrapper)
                effects.set(effect.id, wrapper)
            }
        })

        client.on(EffectRemovePacket, (packet) => {
            let effect = effects.get(packet.effectId)
            effect.die()
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