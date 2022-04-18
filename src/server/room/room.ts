import RoomPortal from "../room-portal";
import {ClientRoomInformant} from "../../networking/packets/game-packets/room-list-packet";

export default class Room implements ClientRoomInformant {
	public maxOnline: number = 10;
	public portal = new RoomPortal()
    name: string = null

    getCurrentOnline(): number {
        return this.portal.clients.size;
    }

    getMaxOnline(): number {
        return this.maxOnline;
    }

    getName(): string {
        return this.name;
    }
}
