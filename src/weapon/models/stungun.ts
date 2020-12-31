import Weapon from '../weapon';

class WeaponStungun extends Weapon {
	public name: any;
	public damage: any;
	public radius: any;
	public squareRadius: any;
	public points: any;

    constructor(config) {
        super(config)
        this.name = config.name || "Stungun"
        this.damage = config.damage || 1.4 // Для каждой точки (то есть если точки две, то суммарный урон в два раза больше)
        this.radius = config.radius || 50
        this.squareRadius = this.radius ** 2
        this.points = [[-7.5, 2], [7.5, 2]]
        this.id = 8
    }

    ready() {
        return true
    }

    shoot(tank?) {
        let player = tank.player
        let game = player.game
        const position = tank.model.body.GetPosition()
        const matrix = tank.model.matrix

        for (let i = this.points.length - 1; i >= 0; i--)
        {
            const point = this.points[i];

            const px = point[0];
            const py = point[1];

            const absX = position.x + (px * matrix.cos + py * matrix.sin);
            const absY = position.y + (-px * matrix.sin + py * matrix.cos);

            for(let each of near(absX, absY, player, game, this.squareRadius)) {
                each.tank.damage(this.damage / game.tps, player.id)
            }
        }
    }
}

const near = function (x, y, tplayer, game, distance) {
    const result = [];
    for (let client of game.clients.values()) {
        const player = client.data.player;

        if (!player) continue
        const tank = player.tank;
        if (!tank) continue

        if (player.id === tplayer.id) continue

        const pos = tank.model.body.GetPosition();
        const dx = pos.x - x;
        const dy = pos.y - y;

        const dist = dx * dx + dy * dy;

        if (dist < distance) {
            result.push(player)
        }
    }
    return result
};

export default WeaponStungun;