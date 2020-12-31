
import ServerBullet from '../serverbullet';
import BulletModelMine from '../../../../entity/bullet/models/mine';
import Utils from '@/utils/utils';

class ServerBulletMine extends ServerBullet {
	public explodeDistance: any;
	public squareExplodeDistance: any;

    constructor(model) {
        super(model);

        this.startVelocity = 0
        this.explodePower = 15
        this.explodeDistance = 5
        this.squareExplodeDistance = this.explodeDistance * this.explodeDistance
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

                    let dist = Utils.distToSegmentSquared(a, b, x1, y1, x2, y2)

                    if(dist < this.squareExplodeDistance) {
                        this.die()
                        return
                    }
                }
            }
        }
    }
}

ServerBullet.associate(ServerBulletMine, BulletModelMine);
export default ServerBulletMine;