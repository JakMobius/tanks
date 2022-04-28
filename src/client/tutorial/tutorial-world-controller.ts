import Game from "../../server/room/game";
import SocketPortalClient from "../../server/socket/socket-portal-client";
import ServerPlayer from "../../server/server-player";
import PhysicalComponent from "../../entity/components/physics-component";
import HealthComponent from "../../entity/components/health-component";
import {EntityType} from "../entity/client-entity";
import EntityModel from "../../entity/entity-model";

export default class TutorialWorldController {
    game: Game;
    private tanks: EntityModel[] = []
    private selectedTanks: Map<ServerPlayer, number> = new Map()

    constructor(serverGame: Game) {
        this.game = serverGame
        this.game.portal.on("client-connect", (client) => this.onClientConnect(client))
        this.game.world.on("player-chat", (player, text) => {
            if(text.startsWith("#")) {
                this.onPlayerCommand(player, text)
            }
        })

        this.createDummies()
    }

    private createTank(entityType: number, x: number, y: number, angle: number) {
        throw "Not implemented"

        // let model = new modelClass()
        // let tank = ServerEntity.fromModel(model) as ServerTank
        // this.game.world.createEntity(tank)
        //
        // const body = model.getComponent(PhysicalComponent).getBody()
        // body.SetPositionXY(x, y)
        // body.SetAngle(angle)
        //
        // this.tanks.push(tank)
    }

    private createDummies() {
        this.createTank(EntityType.TANK_BIGBOI, 50, 205, 0)
        this.createTank(EntityType.TANK_NASTY, 65, 205, 0)
        this.createTank(EntityType.TANK_SNIPER, 80, 200, 0)
        this.createTank(EntityType.TANK_BOMBER, 95, 205, 0)
        this.createTank(EntityType.TANK_MONSTER, 30, 205, 0)
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
        this.respawnPlayer(player)
    }

    private respawnPlayer(player: ServerPlayer) {
        const tank = player.tank

        tank.emit("respawn")

        let body = tank.getComponent(PhysicalComponent)
        body.setPosition({x: 17.5, y: 212.5})
        body.setVelocity({x: 0, y: 0})
        body.setAngle(4)
        body.setAngularVelocity(0)
    }


    private onPlayerCommand(player: ServerPlayer, text: string) {
        if(text == "#switch-tank") {
            let selectedIndex = this.selectedTanks.get(player)
            selectedIndex++
            if(!this.tanks[selectedIndex]) selectedIndex = 0
            this.selectedTanks.set(player, selectedIndex)
            // This may fail if there is more than one player on the map
            player.setTank(this.tanks[selectedIndex])
        }
    }
}