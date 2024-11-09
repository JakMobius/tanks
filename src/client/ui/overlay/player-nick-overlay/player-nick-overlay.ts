/* @load-resource: './player-nick-overlay.scss' */

import BasicEventHandlerSet from "src/utils/basic-event-handler-set";
import Entity from "src/utils/ecs/entity";
import PhysicalComponent from "src/entity/components/physics-component";
import Screen from "src/client/graphics/screen"
import EntityPilotReceiver from "src/entity/components/network/entity-player-list/entity-pilot-receiver";
import TeamColor from "src/utils/team-color";
import View from "src/client/ui/view";
import CameraComponent from "src/client/graphics/camera";

class NickBlock {
    entity: Entity
    element: JQuery
    visited: boolean
    private width: number | null = null
    private height: number | null = null
    private eventHandler = new BasicEventHandlerSet()

    constructor(entity: Entity) {
        this.entity = entity
        this.element = $("<div>").addClass("nick-block")
        this.visited = true

        this.eventHandler.on("pilot-received", () => {
            this.update()
        })
        this.eventHandler.setTarget(this.entity)

        this.update()
    }

    destroy() {
        this.element.remove()
        this.eventHandler.setTarget(null)
    }

    update() {
        let playerList = this.entity.getComponent(EntityPilotReceiver)
        if (!playerList || !playerList.pilot) return

        this.element.empty()
        let color = TeamColor.getColor(playerList.pilot.teamId).code()
        this.element.append($("<span>").css("color", color).text(playerList.pilot.nick))
    }

    setPlayerPosition(x: number, y: number) {
        if (this.width === null) {
            this.width = this.element.outerWidth()
            this.height = this.element.outerHeight()
        }

        x -= this.width / 2
        y -= this.height

        this.element[0].style.left = x + "px"
        this.element[0].style.top = y + "px"
    }
}

export default class PlayerNickOverlay extends View {

    nickBlocks = new Map<Entity, NickBlock>()
    worldEventHandler = new BasicEventHandlerSet()
    world: Entity | null = null
    screen: Screen | null = null
    camera: CameraComponent | null = null

    // In meters
    nickVerticalOffset: number = -3.2

    constructor() {
        super();

        this.worldEventHandler.on("tick", () => {
            this.updateNickBlocks()
        })

        this.element.addClass("player-nick-overlay")
    }

    setGameWorld(world: Entity) {
        this.clearNickBlocks()
        this.world = world
        this.worldEventHandler.setTarget(world)
    }

    setCamera(camera: CameraComponent) {
        this.camera = camera
    }

    setScreen(screen: Screen) {
        this.screen = screen
    }

    clearNickBlocks() {
        for (let block of this.nickBlocks.values()) {
            block.element.remove()
        }
    }

    private updateNickBlocks() {

        for (let block of this.nickBlocks.values()) {
            block.visited = false
        }

        for (let entity of this.world.children) {
            let pilotComponent = entity.getComponent(EntityPilotReceiver)
            if (!pilotComponent) continue

            let pilot = pilotComponent.pilot
            if (!pilot) continue

            let nickBlock = this.nickBlocks.get(entity)

            if (!nickBlock) {
                nickBlock = new NickBlock(entity)
                this.nickBlocks.set(entity, nickBlock)
                this.element.append(nickBlock.element)
            }

            nickBlock.visited = true

            if (this.screen) {
                let physicalComponent = entity.getComponent(PhysicalComponent)
                let position = physicalComponent.getBody().GetPosition()

                let gameX = position.x
                let gameY = position.y + this.nickVerticalOffset

                let x = (this.camera.matrix.transformX(gameX, gameY) + 1) / 2 * this.screen.width
                let y = (-this.camera.matrix.transformY(gameX, gameY) + 1) / 2 * this.screen.height

                nickBlock.setPlayerPosition(x, y)
            }
        }

        for (let block of this.nickBlocks.values()) {
            if (!block.visited) {
                block.destroy()
                this.nickBlocks.delete(block.entity)
            }
        }
    }
}