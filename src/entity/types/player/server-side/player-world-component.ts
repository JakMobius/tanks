import Entity from "src/utils/ecs/entity";
import PlayerWillDisconnectEvent from "src/events/player-will-disconnect-event";
import PlayerWillConnectEvent from "src/events/player-will-connect-event";
import EventHandlerComponent from "src/utils/ecs/event-handler-component";

export default class PlayerWorldComponent extends EventHandlerComponent {
    entity: Entity | null = null
    world: Entity | null = null

    constructor() {
        super()

        this.redirectPlayerEventToWorld("death", "player-death")
        this.redirectPlayerEventToWorld("team-set", "player-team-set")
        this.redirectPlayerEventToWorld("will-disconnect", "player-will-disconnect")
        this.redirectPlayerEventToWorld("connect", "player-connect")
    }

    public redirectPlayerEventToWorld(playerEvent: string, worldEvent: string) {
        const self = this

        this.eventHandler.on(playerEvent, function() {
            if(self.world) self.world.emit(worldEvent, self.entity, ...arguments)
        })
    }

    setWorld(world: Entity | null) {
        this.world = world
        this.entity.emit("world-set", world)
    }

    disconnectFromWorld() {
        this.connectToWorld(null)
    }

    connectToWorld(world: Entity | null) {
        if(this.world == world) return;
        if(this.world) {
            this.entity.emit("will-disconnect", new PlayerWillDisconnectEvent(this.entity))
            let world = this.world
            this.setWorld(null)

            // Send message to the world explicitly, because the player is already disconnected
            // so the event will not be forwarded automatically

            this.entity.emit("disconnect")
            world.emit("player-disconnect", this.entity)
        }

        if(world) {
            let event = new PlayerWillConnectEvent(this.entity)

            // See comment above

            this.entity.emit("will-connect", event)
            world.emit("player-will-connect", this.entity, event)

            this.setWorld(world)
            this.entity.emit("connect", this.entity)
        }
    }
}