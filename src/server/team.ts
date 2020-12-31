
class Team {
	public id: any;
	public color: any;
	public players: any;

    constructor(id, color) {
        this.id = id
        this.color = color
        this.players = new Set()
    }

    remove(player) {
        this.players.delete(player.id)
    }
}

export default Team;
