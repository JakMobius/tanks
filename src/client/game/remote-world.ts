import ClientGameWorld from "../clientgameworld";
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
import {GameWorldConfig} from "../../gameworld";
import Player from "../../utils/player";
import TankModel from "../../tanks/tankmodel";

export interface RemoteClientGameWorldConfig extends GameWorldConfig {
    client: AbstractClient
}

export default class RemoteClientGameWorld extends ClientGameWorld {
    public client: AbstractClient

    constructor(config: RemoteClientGameWorldConfig) {
        super(config)
        this.setupClient()
    }

    private setupClient() {
        this.client.on(MapPacket, (packet) => this.setMap(packet.map))

        this.client.on(PlayerJoinPacket, (packet) => {
            const player = this.newPlayer(packet.player, packet.tank)

            this.emit("player-join", player)
        })

        this.client.on(PlayerSpawnPacket, (packet) => {
            const player = this.newPlayer(packet.player, packet.tank)
            this.player = player

            this.emit("player-spawn", player)
        })

        this.client.on(TankLocationsPacket, (packet) => {
            packet.updateTankLocations(this.players)
        })

        this.client.on(EntityListPacket, (packet) => {
            packet.updateEntities(this.entities)
        })

        this.client.on(EntityCreatePacket, (packet) => {
            packet.createEntities((model) => {
                let wrapper = ClientEntity.fromModel(model)
                if(wrapper) this.entities.set(model.id, wrapper)
            })
        })

        this.client.on(EntityRemovePacket, (packet) => {
            packet.updateEntities(this.entities)
        })

        this.client.on(BlockUpdatePacket, (packet) => {
            this.map.setBlock(packet.x, packet.y, packet.block)
        })

        this.client.on(PlayerLeavePacket, (packet) => {
            const player = this.players.get(packet.playerId)
            this.removePlayer(player)
        })

        this.client.on(EffectCreatePacket, (packet) => {
            let effect = packet.effect
            if(this.effects.has(effect.id))
                this.effects.get(effect.id).die()

            if(effect instanceof TankEffectModel) {
                let player = this.players.get(effect.tankId)
                if (!player || !player.tank) return

                let tank: ClientTank = player.tank as ClientTank

                let wrapper = ClientTankEffect.fromModelAndTank(effect, tank)
                tank.effects.set(effect.id, wrapper)

                this.effects.set(effect.id, wrapper)
            } else if(effect instanceof WorldEffectModel) {
                let wrapper = ClientWorldEffect.fromModelAndWorld(effect, this)
                this.effects.set(effect.id, wrapper)
            }
        })

        this.client.on(EffectRemovePacket, (packet) => {
            let effect = this.effects.get(packet.id)
            effect.die()
            this.effects.delete(packet.id)

            if(effect.model instanceof TankEffectModel) {
                let player = this.players.get(effect.model.tankId)
                if (!player || !player.tank) return

                let tank = player.tank as ClientTank
                tank.effects.delete(packet.id)
            } else if(effect.model instanceof WorldEffectModel) {
                this.effects.delete(packet.id)
            }
        })
    }

    private newPlayer(player: Player, tank: TankModel) {
        this.createPlayer(player)

        let newTank = ClientTank.fromModel(tank)

        player.setTank(newTank)
        player.tank.world = this
        player.tank.model.initPhysics(this.world)

        return player
    }
}