import Player from "../server/player";

export interface PlayerConnectDeclineReason {
    message?: string
}

export default class PlayerConnectEvent {
    player: Player

    declined: boolean = false
    declineReason?: PlayerConnectDeclineReason

    constructor(player: Player) {
        this.player = player
    }

    declineWithMessage(reason: PlayerConnectDeclineReason) {
        this.declined = true
        this.declineReason = reason
    }
}