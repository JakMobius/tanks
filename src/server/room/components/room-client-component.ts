import RoomPortal from "../../room-portal";
import {Component} from "../../../utils/ecs/component";
import Entity from "../../../utils/ecs/entity";
import ServerWorldBridge from "../../server-world-bridge";

export interface ServerRoomClientComponentOptions {
    name: string
}

export default class RoomClientComponent implements Component {
	public maxOnline: number = 10
	public portal = new RoomPortal()
    name?: string = null
    entity: Entity | null

    constructor(options: ServerRoomClientComponentOptions) {
        this.name = options.name

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
