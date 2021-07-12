import AbstractClient from "../../networking/abstract-client";
import MapPacket from "../../networking/packets/game-packets/mappacket";
import PlayerJoinPacket from "../../networking/packets/game-packets/playerjoinpacket";
import PlayerSpawnPacket from "../../networking/packets/game-packets/playerspawnpacket";
import TankLocationsPacket from "../../networking/packets/game-packets/gamestatepacket";
import EntityListPacket from "../../networking/packets/game-packets/entitylistpacket";
import EntityCreatePacket from "../../networking/packets/game-packets/entitycreatepacket";
import ClientEntity from "../entity/cliententity";
import EntityRemovePacket from "../../networking/packets/game-packets/entityremovepacket";
import BlockUpdatePacket from "../../networking/packets/game-packets/blockupdatepacket";
import PlayerLeavePacket from "../../networking/packets/game-packets/playerleavepacket";
import EffectCreatePacket from "../../networking/packets/game-packets/effectcreatepacket";
import TankEffectModel from "../../effects/tank/tankeffectmodel";
import ClientTank from "../tanks/clienttank";
import ClientTankEffect from "../effects/tank/clienttankeffect";
import WorldEffectModel from "../../effects/world/world-effect-model";
import ClientWorldEffect from "../effects/world/clientworldeffect";
import EffectRemovePacket from "../../networking/packets/game-packets/effectremovepacket";
import ClientGameWorld from "../clientgameworld";

export default class ClientWorldBridge {
    static buildBridge(client: AbstractClient, world: ClientGameWorld) {
        client.on(MapPacket, (packet) => world.setMap(packet.map))

        client.on(PlayerJoinPacket, (packet) => {
            let newTank = ClientTank.fromModel(packet.tank)
            packet.player.setTank(newTank)
            world.createPlayer(packet.player)
            world.emit("player-join", packet.player)
        })

        client.on(PlayerSpawnPacket, (packet) => {
            let newTank = ClientTank.fromModel(packet.tank)
            packet.player.setTank(newTank)
            world.createPlayer(packet.player)
            world.emit("player-spawn", packet.player)
        })

        client.on(TankLocationsPacket, (packet) => {
            packet.updateTankLocations(world.players)
        })

        client.on(EntityListPacket, (packet) => {
            packet.updateEntities(world.entities)
        })

        client.on(EntityCreatePacket, (packet) => {
            packet.createEntities((model) => {
                let wrapper = ClientEntity.fromModel(model)
                if(wrapper) world.entities.set(model.id, wrapper)
            })
        })

        client.on(EntityRemovePacket, (packet) => {
            packet.updateEntities(world.entities)
        })

        client.on(BlockUpdatePacket, (packet) => {
            world.map.setBlock(packet.x, packet.y, packet.block)
        })

        client.on(PlayerLeavePacket, (packet) => {
            const player = world.players.get(packet.playerId)
            world.removePlayer(player)
        })

        client.on(EffectCreatePacket, (packet) => {
            let effect = packet.effect
            if(world.effects.has(effect.id))
                world.effects.get(effect.id).die()

            if(effect instanceof TankEffectModel) {
                let player = world.players.get(effect.tankId)
                const tank = player.tank
                if (!player || !tank) return

                let wrapper = ClientTankEffect.fromModelAndTank(effect, tank)
                tank.effects.set(effect.id, wrapper)

                world.effects.set(effect.id, wrapper)
            } else if(effect instanceof WorldEffectModel) {
                let wrapper = ClientWorldEffect.fromModelAndWorld(effect, world)
                world.effects.set(effect.id, wrapper)
            }
        })

        client.on(EffectRemovePacket, (packet) => {
            let effect = world.effects.get(packet.id)
            effect.die()
            world.effects.delete(packet.id)

            if(effect.model instanceof TankEffectModel) {
                let player = world.players.get(effect.model.tankId)
                if (!player || !player.tank) return

                player.tank.effects.delete(packet.id)
            } else if(effect.model instanceof WorldEffectModel) {
                world.effects.delete(packet.id)
            }
        })
    }
}