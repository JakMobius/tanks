
import {HubPage} from "src/client/hub/ui/hub-page";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import Entity from "src/utils/ecs/entity";
import {clientGameWorldEntityPrefab} from "src/client/entity/client-game-world-entity-prefab";
import {getHubMap} from "src/client/hub/hub-map";
import CameraPositionController from "src/entity/components/camera-position-controller";
import GameMap from "src/map/game-map";
import TransformComponent from "src/entity/components/transform-component";
import CameraComponent from "src/client/graphics/camera";
import WorldDrawerComponent from "src/client/entity/components/world-drawer-component";
import Scene from "src/client/scenes/scene";
import CameraRandomMovement from "src/entity/components/camera-random-movement";

export default class HubScene extends Scene {
    hub: HubPage
    backgroundWorld: Entity
    map: GameMap
    camera: Entity

    constructor() {
        super();

        this.setTitle("Танчики - Хаб")

        this.map = getHubMap()

        this.backgroundWorld = new Entity()
        clientGameWorldEntityPrefab(this.backgroundWorld, {
            map: this.map
        })

        let userData = (window as any).userData as any as UserDataRaw
        this.hub = new HubPage(userData);
        this.overlayContainer.append(this.hub.element)
    }

    private setupCamera() {
        this.camera = new Entity()
        this.camera.addComponent(new TransformComponent())
        this.camera.addComponent(new CameraComponent())
        this.camera.addComponent(new CameraRandomMovement()
            .setViewport({x: this.screen.width, y: this.screen.height})
            .setMapSize(this.map.width * GameMap.BLOCK_SIZE, this.map.height * GameMap.BLOCK_SIZE))

        this.camera.addComponent(new WorldDrawerComponent(this.screen))
    }

    layout() {
        super.layout();
        this.camera.getComponent(CameraRandomMovement)
            .setViewport({x: this.screen.width, y: this.screen.height})
    }

    appear() {
        super.appear();
        this.setupCamera()
        this.backgroundWorld.appendChild(this.camera)
    }

    disappear() {
        super.disappear();
        this.camera.removeFromParent()
    }

    draw(dt: number) {
        super.draw(dt);
        this.backgroundWorld.emit("tick", dt)
        this.backgroundWorld.emit("draw")
    }
}