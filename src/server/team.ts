import Color from "../utils/color";
import Player from "../utils/player";

class Team {
	public id: any;
	public color: any;
	public players: any;

    constructor(id: number, color: Color) {
        this.id = id
        this.color = color
        this.players = new Set()
    }

    remove(player: Player) {
        this.players.delete(player.id)
    }
}

export default Team;
