
const ServerBullet = require("../serverbullet")
const BulletModelMine = require("../../../../entity/bullet/models/mine")
const distToSegment = require("../../../misc/distToSegment")

class ServerBulletMine extends ServerBullet {
    constructor(model) {
        super(model);

        this.startVelocity = 0
        this.explodePower = 15
    }

    tick(dt) {
        const a = this.model.x, b = this.model.y;

        for(let player of this.shooter.world.players.values()) {

            if(this.shooter === player) continue

            let tank = player.tank
            let body = tank.model.body

            let x = tank.model.x
            let y = tank.model.y
            let sin = tank.model.matrix.sin
            let cos = tank.model.matrix.cos

            for(let v = body.GetFixtureList(); v; v = v.GetNext()) {
                let shape = v.GetShape().GetVertices()

                for (let i = shape.length - 1; i >= 0; i--) {
                    let vertex = shape[i]
                    let previousVertex
                    if(i > 0) previousVertex = shape[i - 1]
                    else previousVertex = shape[shape.length - 1]

                    let x1 = vertex.x * cos - vertex.y * sin + x
                    let y1 = vertex.x * sin + vertex.y * cos + y

                    let x2 = previousVertex.x * cos - previousVertex.y * sin + x
                    let y2 = previousVertex.x * sin + previousVertex.y * cos + y

                    let dist = distToSegment(a, b, x1, y1, x2, y2)

                    if(dist < 5) {
                        this.die()
                        return
                    }
                }
            }
        }
    }
}

ServerBullet.associate(ServerBulletMine, BulletModelMine);
module.exports = ServerBulletMine