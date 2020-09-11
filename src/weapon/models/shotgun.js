const Weapon = require("../weapon");
const Box2D = require("../../library/box2d");

class Shotgun extends Weapon {
    constructor(config) {
        super(config);
        this.name = config.name || "Shotgun"
        this.damage = config.damage || 6
        this.radius = config.radius || 60
        this.squareRadius = this.radius ** 2
        this.shootRate = config.shootRate || 800
        this.reloadTime = config.reloadTime || 4000
        this.maxAmmo = config.maxAmmo || 3
        this.effectID = 2
        this.angle = Math.PI / 2
        this.id = 7
    }

    clone() {
        return new Shotgun(this)
    }

    shoot(tank) {
        // TODO
        // const player = tank.player
        // const bx = -tank.model.matrix.sin * 7000;
        // const by = tank.model.matrix.cos * 7000;
        // const screen = player.screen
        //
        // const position = tank.model.body.GetPosition()
        //
        // tank.model.body.ApplyImpulse(new Box2D.b2Vec2(-bx, -by), position)
        //
        // const pAngle = (tank.model.rotation + Math.PI) % (Math.PI * 2) - Math.PI;
        //
        // for (let client of screen.clients.values()) {
        //     const p = client.data.player;
        //
        //     if (!p || p.id === player.id) continue
        //
        //     const otherTank = p.tank
        //     const otherPosition = otherTank.model.body.GetPosition()
        //
        //     const x = otherPosition.x - position.x;
        //     const y = otherPosition.y - position.y;
        //
        //     const dist = x ** 2 + y ** 2;
        //
        //     if (dist > this.squareRadius) continue
        //
        //     let angle = Math.atan2(x, y) + pAngle;
        //
        //     if (angle > Math.PI) angle -= Math.PI * 2
        //     if (angle < -Math.PI) angle += Math.PI * 2
        //
        //     if (Math.abs(angle) >= this.angle / 2) continue
        //
        //     const lengthCoef = (Math.sqrt(1 - dist / this.squareRadius
        //     ));
        //     const damage = lengthCoef * this.damage;
        //
        //     p.tank.damage(damage, player.id)
        //
        //     tank.model.body.ApplyImpulse(new b2Vec2(lengthCoef * bx, lengthCoef * by), position)
        // }
        //
        // this.popBullet()
        //
        // const msg = JSON.stringify({
        //     cmd: "ent",
        //     p: [{
        //         i: screen.entityID++,
        //         s: player.id,
        //         w: this.name,
        //     }]
        // });
        //
        // screen.broadcast(msg)
    }
}

module.exports = Shotgun