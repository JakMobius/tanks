import SocketPortalClient from "src/server/socket/socket-portal-client";
import PhysicalComponent from "src/entity/components/physics-component";
import Player from "src/server/player";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import PlayerConnectionManager from "src/server/player-connection-manager";
import {EntityType} from "src/entity/entity-type";
import Entity from "src/utils/ecs/entity";

export default class TutorialWorldController {
    game: Entity;
    private tanks: Entity[] = []
    private selectedTanks: Map<Player, number> = new Map()

    constructor(serverGame: Entity) {
        this.game = serverGame

        this.game.on("client-connect", (client) => this.onClientConnect(client))
        this.game.on("game-chat", (player, text) => {
            if(text.startsWith("#")) {
                this.onPlayerCommand(player, text)
            }
        })

        this.createDummies()
    }

    private createTank(entityType: number, x: number, y: number, angle: number) {
        const tank = new Entity()
        ServerEntityPrefabs.types.get(entityType)(tank)
        this.game.appendChild(tank)
        tank.emit("respawn")

        const body = tank.getComponent(PhysicalComponent).getBody()
        body.SetPositionXY(x, y)
        body.SetAngle(angle)

        this.tanks.push(tank)
    }

    private createDummies() {
        this.createTank(EntityType.TANK_BIGBOI, 50, 205, 0)
        this.createTank(EntityType.TANK_NASTY, 65, 205, 0)
        this.createTank(EntityType.TANK_SNIPER, 80, 200, 0)
        this.createTank(EntityType.TANK_BOMBER, 95, 205, 0)
        this.createTank(EntityType.TANK_MONSTER, 30, 205, 0)
    }

    private onClientConnect(client: SocketPortalClient) {

        const player = new Player({
            nick: "Вы"
        })

        PlayerConnectionManager.attach(player, client)
        player.connectToWorld(this.game)

        const selectedIndex = 0
        const tank = this.tanks[selectedIndex]

        this.selectedTanks.set(player, selectedIndex)
        player.setTank(tank)
        this.respawnPlayer(player)
    }

    private respawnPlayer(player: Player) {
        const tank = player.tank
        let body = tank.getComponent(PhysicalComponent)
        body.setPosition({x: 17.5, y: 212.5})
        body.setVelocity({x: 0, y: 0})
        body.setAngle(4)
        body.setAngularVelocity(0)
    }

    private onPlayerCommand(player: Player, text: string) {
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