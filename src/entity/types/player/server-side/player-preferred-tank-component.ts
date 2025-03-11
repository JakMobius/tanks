import Entity from "src/utils/ecs/entity";
import EntityDataTransmitComponent from "src/entity/components/network/transmitting/entity-data-transmit-component";
import PlayerConnectionManagerComponent from "src/entity/types/player/server-side/player-connection-manager-component";
import {UserChooseTankMessageTransmitter} from "src/entity/components/network/event/user-message-transmitters";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";
import PlayerDataComponent from "src/entity/types/player/server-side/player-data-component";
import PlayerWorldComponent from "src/entity/types/player/server-side/player-world-component";
import ServerEntityPrefabs from "src/server/entity/server-entity-prefabs";
import { EntityType } from "src/entity/entity-prefabs";

export default class PlayerPreferredTankComponent extends EventHandlerComponent {
    preferredTank: string | null = null
    private fetchingPreferredTank = false

    constructor() {
        super()
        this.eventHandler.on("preferred-tank-set", (tankType) => {
            this.preferredTank = tankType
        })
    }

    protected async fetchPreferredTankFromDB() {
        let dataComponent = this.entity.getComponent(PlayerDataComponent)
        let userInfo = await dataComponent.getUserInfo()
        if(!userInfo) return undefined

        return userInfo.preferredTank
    }

    private getPlayerWorld() {
        return this.entity.getComponent(PlayerWorldComponent).world
    }

    public getWorldTransmitterSet() {
        let world = this.getPlayerWorld()
        if(!world) return null

        let worldTransmitComponent = world.getComponent(EntityDataTransmitComponent)
        let playerConnectionComponent = this.entity.getComponent(PlayerConnectionManagerComponent)
        return worldTransmitComponent.transmitterSets.get(playerConnectionComponent.end)
    }

    private determinePreferredTank() {
        this.fetchingPreferredTank = true
        this.fetchPreferredTankFromDB().then((preferredTank) => {
            // If the player exited the room before the DB query finished, don't do anything
            let world = this.getPlayerWorld()
            if (!world) return

            if (!preferredTank) {
                this.askPlayerForPreferredTank()
            } else {
                this.entity.emit("preferred-tank-set", preferredTank)
            }
            this.fetchingPreferredTank = false
        })
    }

    private askPlayerForPreferredTank() {
        let worldTransmitterSet = this.getWorldTransmitterSet()
        let transmitter = worldTransmitterSet.getTransmitter(UserChooseTankMessageTransmitter)
        transmitter.sendChooseTankMessage()
    }

    private async updatePreferredTank() {
        let dataComponent = this.entity.getComponent(PlayerDataComponent)
        if(!dataComponent) return undefined

        let userInfo = await dataComponent.getUserInfo()
        userInfo.preferredTank = this.preferredTank
        await dataComponent.modifyUserInfo(userInfo)

        return userInfo.preferredTank
    }

    onAttach(entity: Entity): void {
        super.onAttach(entity)

        this.determinePreferredTank()

        const worldComponent = this.entity.getComponent(PlayerWorldComponent)
        worldComponent.redirectPlayerEventToWorld("preferred-tank-set", "player-preferred-tank-set")
    }

    selectPreferredTank(tank: string) {
        if(tank === this.preferredTank) {
            return
        }

        if(ServerEntityPrefabs.getById(tank)?.metadata.type !== EntityType.tank) {
            return
        }

        this.entity.emit("preferred-tank-set", tank)
        this.updatePreferredTank().then()
    }
}