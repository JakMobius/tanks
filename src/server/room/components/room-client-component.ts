import RoomPortal from "src/server/room-portal";
import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import ServerWorldBridge from "src/server/server-world-bridge";

export interface ServerRoomClientComponentOptions {
    name: string
    mode?: string
}

export default class RoomClientComponent implements Component {
	public maxOnline: number = 10
	public portal = new RoomPortal()
    name?: string = null
    mode?: string = null
    entity: Entity | null

    constructor(options: ServerRoomClientComponentOptions) {
        this.name = options.name
        this.mode = options.mode

        this.portal.on("client-connect",    (client) => this.entity.emit("client-connect", client))
        this.portal.on("client-disconnect", (client) => this.entity.emit("client-disconnect", client))
    }

    getCurrentOnline(): number {
        return this.portal.clients.size;
    }

    getMaxOnline(): number {
        return this.maxOnline;
    }

    onAttach(entity: Entity): void {
        this.entity = entity

        ServerWorldBridge.buildBridge(this.entity, this.portal)
    }

    onDetach(): void {
        this.entity = null
    }
}
