import SocketPortalClient from "src/server/socket/socket-portal-client";
import PhysicalComponent from "src/entity/components/physics-component";
import Entity from "src/utils/ecs/entity";
import PlayerPrefab from "src/entity/types/player/server-prefab";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";
import EventEmitter from "src/utils/event-emitter";
import PlayerRespawnEvent from "src/events/player-respawn-event";
import HealthComponent from "src/entity/components/health/health-component";
import TransformComponent from "src/entity/components/transform/transform-component";
import { EntityPrefab } from "src/entity/entity-prefabs";
import BigboiPrefab from "src/entity/types/tank-bigboi/server-prefab";
import TinyPrefab from "src/entity/types/tank-tiny/server-prefab";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";

export default class TutorialWorldController {
    game: Entity;
    private tanks: Entity[] = []
    private selectedTanks: Map<Entity, number> = new Map()

    constructor(serverGame: Entity) {
        this.game = serverGame

        this.game.on("client-connect", (client) => this.onClientConnect(client))
        this.game.on("tick", () => {
            this.onTick()
        })
        this.game.on("player-respawn", (player, event) => this.onPlayerRespawn(player, event), EventEmitter.PRIORITY_MONITOR)

        this.createDummies()
    }

    private createTank(prefab: EntityPrefab, x: number, y: number, angle: number) {
        const tank = new Entity()
        prefab.prefab(tank)
        this.game.appendChild(tank)

        const body = tank.getComponent(PhysicalComponent).getBody()
        body.SetTransformXY(x, y, angle)

        this.tanks.push(tank)
    }

    private createDummies() {
        // this.createTank(EntityType.TANK_NASTY, 65, 205, 0)
        // this.createTank(EntityType.TANK_SNIPER, 80, 200, 0)
        // this.createTank(EntityType.TANK_BOMBER, 95, 205, 0)
        // this.createTank(EntityType.TANK_MONSTER, 30, 205, 0)
        this.createTank(BigboiPrefab, 50, 205, 0)
        this.createTank(TinyPrefab, 30, 205, 0)
    }

    private onClientConnect(client: SocketPortalClient) {

        const player = new Entity()

        PlayerPrefab.prefab(player)
        player.getComponent(PlayerConnectionManagerComponent).setClient(client)
        player.getComponent(PlayerWorldComponent).connectToWorld(this.game)

        const selectedIndex = 0
        const tank = this.tanks[selectedIndex]

        this.selectedTanks.set(player, selectedIndex)
        player.getComponent(PlayerTankComponent).setTank(tank)
        this.respawnPlayer(player)
    }

    private respawnPlayer(player: Entity) {
        const tank = player.getComponent(PlayerTankComponent).tank
        let body = tank.getComponent(PhysicalComponent)
        let health = tank.getComponent(HealthComponent)

        body.setVelocity({x: 0, y: 0})
        body.setAngularVelocity(0)
        health.setHealth(health.getMaxHealth())

        tank.getComponent(TransformComponent).setGlobal({
            position: {x: 17.5, y: 212.5},
            angle: 0
        })
    }

    private onPlayerCommand(player: Entity, text: string) {
        if(text == "#switch-tank") {
            let selectedIndex = this.selectedTanks.get(player)
            selectedIndex++
            if(!this.tanks[selectedIndex]) selectedIndex = 0
            this.selectedTanks.set(player, selectedIndex)
            // This may fail if there is more than one player on the map
            player.getComponent(PlayerTankComponent).setTank(this.tanks[selectedIndex])
        }
    }

    private onTick() {
        // let tank = this.tanks[0]
        // let component = tank.getComponent(PhysicalComponent)
        // console.log(component.getBody().GetPosition(), component.getBody().GetLinearVelocity())
    }

    private onPlayerRespawn(player: Entity, event: PlayerRespawnEvent) {
        this.respawnPlayer(player)
    }
}