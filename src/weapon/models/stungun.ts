import Weapon, {WeaponConfig} from '../weapon';
import Game from "../../server/room/game";
import Player from "../../utils/player";

export interface WeaponStungunConfig extends WeaponConfig {
    damage: number
    radius: number
}

class WeaponStungun extends Weapon {
	public damage: number;
	public radius: number;
	public squareRadius: number;
	public points: number[][];

    constructor(config: WeaponStungunConfig) {
        super(config)
        this.damage = config.damage || 1.4 // Для каждой точки (то есть если точки две, то суммарный урон в два раза больше)
        this.radius = config.radius || 50
        this.squareRadius = this.radius ** 2
        this.points = [[-7.5, 2], [7.5, 2]]
        this.id = 8
    }

    ready() {
        return true
    }

    shoot() {
        let tank = this.tank
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

const near = function (x: number, y: number, tplayer: Player, game: Game, distance: number) {
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