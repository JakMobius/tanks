/* @load-resource: './player-nick-overlay.scss' */

import Overlay, {OverlayConfig} from "../../../../ui/overlay/overlay";
import BasicEventHandlerSet from "../../../../../utils/basic-event-handler-set";
import Entity from "../../../../../utils/ecs/entity";
import PhysicalComponent from "../../../../../entity/components/physics-component";
import Camera from "../../../../camera";
import EntityPilotListReceiver
    from "../../../../../entity/components/network/entity-player-list/entity-pilot-list-receiver";
import TeamColor from "../../../../../utils/team-color";

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

        this.eventHandler.on("pilot-list-received", () => {
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
        let playerList = this.entity.getComponent(EntityPilotListReceiver)
        if(!playerList || playerList.pilotList.length == 0) return

        this.element.empty()
        for(let player of playerList.pilotList) {
            let color = TeamColor.getColor(player.teamId).code()
            this.element.append($("<span>").css("color", color).text(player.nick))
        }
    }

    setPlayerPosition(x: number, y: number) {
        if(this.width === null) {
            this.width = this.element.outerWidth()
            this.height = this.element.outerHeight()
        }

        x -= this.width / 2
        y -= this.height

        this.element[0].style.left = x + "px"
        this.element[0].style.top = y + "px"
    }
}

export default class PlayerNickOverlay extends Overlay {

    nickBlocks = new Map<Entity, NickBlock>()
    worldEventHandler = new BasicEventHandlerSet()
    world: Entity | null = null
    camera: Camera | null = null

    // In meters
    nickVerticalOffset: number = -3.2

    constructor(options: OverlayConfig) {
        super(options);

        this.worldEventHandler.on("tick", () => {
            this.updateNickBlocks()
        })

        this.overlay.addClass("player-nick-overlay")
    }

    setWorld(world: Entity) {
        this.clearNickBlocks()
        this.world = world
        this.worldEventHandler.setTarget(world)
    }

    setCamera(camera: Camera) {
        this.camera = camera
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
            if(!entity.getComponent(EntityPilotListReceiver)) continue

            let nickBlock = this.nickBlocks.get(entity)

            if (!nickBlock) {
                nickBlock = new NickBlock(entity)
                this.nickBlocks.set(entity, nickBlock)
                this.overlay.append(nickBlock.element)
            }

            nickBlock.visited = true

            if (this.camera) {
                let physicalComponent = entity.getComponent(PhysicalComponent)
                let position = physicalComponent.getBody().GetPosition()

                let gameX = position.x
                let gameY = position.y + this.nickVerticalOffset

                let x = (this.camera.matrix.transformX(gameX, gameY) + 1) / 2 * this.camera.viewport.x
                let y = (-this.camera.matrix.transformY(gameX, gameY) + 1) / 2 * this.camera.viewport.y

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