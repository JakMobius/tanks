import Color from "../utils/color";
import AbstractPlayer from "../abstract-player";

class Team {
	public id: any;
	public color: any;
	public players: any;

    constructor(id: number, color: Color) {
        this.id = id
        this.color = color
        this.players = new Set()
    }

    remove(player: AbstractPlayer) {
        this.players.delete(player.id)
    }
}

export default Team;
