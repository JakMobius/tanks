
class Team {
    constructor(id, color) {
        this.id = id
        this.color = color
        this.players = new Set()
    }

    remove(player) {
        this.players.delete(player.id)
    }
}

module.exports = Team
