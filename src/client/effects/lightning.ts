
import FX from '../sound/fx';
import ClientEffect from './clienteffect';

class Lightning extends Effect {
	public roughness: any;
	public maxDifference: any;
	public minSegmentHeight: any;
	public points: any;
	public lightnings: any;
	public updateMS: any;
	public lastUpdate: any;
	public distance: any;
	public idleDistance: any;
	public player: any;
	public sound: any;
	public game: any;
	public dead: any;

    constructor(game) {
        super(game)
        this.roughness = 1.5;
        this.maxDifference = 0.166;
        this.minSegmentHeight = 0.1;
        this.points = [[-7.5, 2], [7.5, 2]]
        this.lightnings = []
        this.updateMS = 40
        this.lastUpdate = 0
        this.distance = 50
        this.idleDistance = 20
    }

    start(player) {
        this.player = player
        this.sound = this.game.playSound(FX.TESLA_START, {
            mapX: player.tank.model.x,
            mapY: player.tank.model.y,
            volume: 0.3
        })
        const self = this;

        console.log(this.sound)

        setTimeout(function() {
            if(!self.dead) {
                self.sound = self.game.playSound(FX.TESLA_SOUND, {
                    mapX: player.tank.model.x,
                    mapY: player.tank.model.y,
                    volume: 0.3,
                    loop: true
                })
            }
        }, this.sound.buffer.duration * 1000)
    }

    stop() {
        this.sound.stop()
        this.dead = true
    }

    getLightning(length?) {

        const y = 1;
        let segmentHeight = 1;
        let lightning = [];

        lightning.push({x: 0, y: 0});
        lightning.push({x: 0, y: 1});

        let currDiff = this.maxDifference;
        while (segmentHeight > this.minSegmentHeight) {

            const newSegments = [];
            for (let i = 0; i < lightning.length - 1; i++) {

                const start = lightning[i];
                const end = lightning[i + 1];

                const midX = (start.x + end.x) / 2;
                const newX = midX + (Math.random() * 2 - 1) * currDiff;

                newSegments.push(start, {x: newX, y: (start.y + end.y) / 2});
            }

            newSegments.push(lightning.pop());
            lightning = newSegments;

            currDiff /= this.roughness;
            segmentHeight /= 2;
        }
        lightning.angle = Math.random() * 2 * Math.PI
        return lightning;
    }

    near(x, y, tplayer) {
        const result = [];
        for(let player of game.players.values()) {
            if(player.id === tplayer.id) continue

            const dx = player.tank.model.x - x;
            const dy = player.tank.model.y - y;

            const dist = Math.sqrt(dx * dx + dy * dy);

            if(dist < this.distance) {
                result.push([player.tank.model.x, player.tank.model.y, dist])
            }
        }
        return result
    }

    lightning(index) {
        if(this.lightnings.length <= index) {
            const lightning = this.getLightning();
            this.lightnings.push(lightning)
            return lightning
        }
        return this.lightnings[index]
    }

    draw(ctx) {
        const player = this.player;

        this.sound.config.mapX = player.tank.model.x
        this.sound.config.mapY = player.tank.model.y

        const game = this.game;

        game.updateSoundPosition(this.sound)

        const tank = player.tank;
        ctx.save()
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "hsl(180, 80%, 80%)";
        ctx.strokeStyle = "hsl(180, 80%, 80%)";

        const time = Date.now();
        if(time - this.lastUpdate > this.updateMS) {
            this.lastUpdate = time
            this.lightnings = []
        }

        let lindex = 0;

        for (let i = this.points.length - 1; i >= 0; i--)
        {
            const point = this.points[i];

            const px = point[0];
            const py = point[1];

            const absX = tank.model.x + (px * tank.model.matrix.cos + py * tank.model.matrix.sin);
            const absY = tank.model.y + (-px * tank.model.matrix.sin + py * tank.model.matrix.cos);

            const near = this.near(absX, absY, player);

            if(near.length === 0) {
                ctx.save()
                ctx.beginPath();
                ctx.translate(px, py)
                const lightning = this.lightning(lindex++);

                ctx.rotate(lightning.angle)

                for (let j = 0; j < lightning.length; j++) {
                    ctx.lineTo(lightning[j].x * this.idleDistance, lightning[j].y * this.idleDistance);
                }
                ctx.stroke()
                ctx.restore()
            } else {
                for(let pos of near) {
                    ctx.save()
                    ctx.beginPath();
                    ctx.translate(px, py)
                    const lightning = this.lightning(lindex++)
                    const angle = -Math.atan2(pos[0] - absX, pos[1] - absY);
                    const length = pos[2];

                    ctx.rotate(angle + tank.model.rotation)

                    for (let j = 0; j < lightning.length; j++) {
                        ctx.lineTo(lightning[j].x * length, lightning[j].y * length);
                    }
                    ctx.stroke()
                    ctx.restore()
                }
            }

        }
        ctx.restore()
    }
}

export default Lightning;