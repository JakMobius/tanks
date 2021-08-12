
import Game from "../../server/room/game";
import SocketPortalClient from "../../server/socket/socket-portal-client";
import ServerPlayer from "../../server/server-player";
import ServerTank from "../../server/entity/tank/servertank";
import SniperTankModel from "../../entity/tanks/models/sniper-tank-model";
import TankModel from "../../entity/tanks/tank-model";
import ServerEntity from "../../server/entity/serverentity";
import BomberTankModel from "../../entity/tanks/models/bomber-tank-model";
import MonsterTankModel from "../../entity/tanks/models/monster-tank-model";
import {Constructor} from "../../serialization/binary/serializable";
import BigBoiTankModel from "../../entity/tanks/models/bigboi-tank-model";
import NastyTankModel from "../../entity/tanks/models/nasty-tank-model";

export default class TutorialWorldController {
    game: Game;
    private tanks: ServerTank[] = []
    private selectedTanks: Map<ServerPlayer, number> = new Map()

    constructor(serverGame: Game) {
        this.game = serverGame
        this.game.portal.on("client-connect", (client) => this.onClientConnect(client))
        this.game.world.on("player-create", (player) => this.onPlayerCreate(player))
        this.game.world.on("player-chat", (player, text) => {
            if(text.startsWith("#")) {
                this.onPlayerCommand(player, text)
            }
        })

        this.createDummies()
    }

    private createTank(modelClass: Constructor<TankModel>, x: number, y: number, angle: number) {
        let model = new modelClass()
        let tank = ServerEntity.fromModel(model) as ServerTank
        this.game.world.createEntity(tank)

        tank.teleport(x, y)

        const body = model.getBody()
        body.SetAngle(angle)

        this.tanks.push(tank)
    }

    private createDummies() {
        this.createTank(BigBoiTankModel, 200, 820, 0)
        this.createTank(NastyTankModel, 260, 820, 0)
        this.createTank(SniperTankModel, 320, 800, 0)
        this.createTank(BomberTankModel, 380, 820, 0)
        this.createTank(MonsterTankModel, 120, 820, 0)
    }

    private onPlayerCreate(player: ServerPlayer) {

    }

    private onClientConnect(client: SocketPortalClient) {

        const selectedIndex = 0
        const tank = this.tanks[selectedIndex]

        const player = new ServerPlayer({
            id: client.id,
            nick: "Вы",
            tank: tank
        })
        client.data.player = player

        this.selectedTanks.set(player, selectedIndex)
        this.game.world.createPlayer(player)
        this.respawnPlayer(player)
    }

    private respawnPlayer(player: ServerPlayer) {
        const tank = player.tank
        const model = tank.model
        const body = model.getBody()

        model.setHealth((model.constructor as typeof TankModel).getMaximumHealth())

        tank.teleport(70, 850)
        tank.setVelocity(0, 0)
        body.SetAngle(4)
        body.SetAngularVelocity(0)
    }


    private onPlayerCommand(player: ServerPlayer, text: string) {
        if(text == "#switch-tank") {
            let selectedIndex = this.selectedTanks.get(player)
            selectedIndex++
            if(!this.tanks[selectedIndex]) selectedIndex = 0
            this.selectedTanks.set(player, selectedIndex)
            // This may fail if there is more than one player on the map
            player.setTank(this.tanks[selectedIndex])
            this.game.world.createPlayer(player)
        }
    }
}