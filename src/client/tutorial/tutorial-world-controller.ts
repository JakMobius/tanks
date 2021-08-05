
import Game from "../../server/room/game";
import SocketPortalClient from "../../server/socket/socket-portal-client";
import ServerPlayer from "../../server/server-player";
import ServerTank from "../../server/entity/tank/servertank";
import SniperTankModel from "../../entity/tanks/models/sniper-tank-model";
import TankModel from "../../entity/tanks/tank-model";
import ServerEntity from "../../server/entity/serverentity";
import BomberTankModel from "../../entity/tanks/models/bomber-tank-model";
import MonsterTankModel from "../../entity/tanks/models/monster-tank-model";

export default class TutorialWorldController {
    game: Game;

    constructor(serverGame: Game) {
        this.game = serverGame
        this.game.portal.on("client-connect", (client) => this.onClientConnect(client))
        this.game.world.on("player-create", (player) => this.onPlayerCreate(player))
    }

    private onPlayerCreate(player: ServerPlayer) {

    }

    private onClientConnect(client: SocketPortalClient) {

        let model = new MonsterTankModel()
        let tank = ServerEntity.fromModel(model) as ServerTank
        this.game.world.createEntity(tank)

        const player = new ServerPlayer({
            id: client.id,
            nick: "Вы",
            tank: tank
        })

        client.data.player = player

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
}