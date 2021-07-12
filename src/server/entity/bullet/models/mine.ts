
import ServerBullet from '../serverbullet';
import BulletModelMine from '../../../../entity/bullet/models/mine';
import Utils from 'src/utils/utils';
import BulletModel from "../../../../entity/bullet/bulletmodel";
import * as Box2D from "src/library/box2d"

class ServerBulletMine extends ServerBullet {

    static Model = BulletModelMine
    private explodeDistance: number;
    private squareExplodeDistance: number;

    constructor(model: BulletModelMine) {
        super(model);

        this.startVelocity = 0
        this.explodePower = 15
        this.explodeDistance = 5
        this.squareExplodeDistance = this.explodeDistance * this.explodeDistance
    }

    tick(dt: number) {
        const a = this.model.x, b = this.model.y;

        for(let player of this.shooter.getWorld().players.values()) {

            if(this.shooter === player) continue

            let tank = player.tank
            let body = tank.model.body

            let x = tank.model.x
            let y = tank.model.y
            let sin = tank.model.matrix.sin
            let cos = tank.model.matrix.cos

            for(let v = body.GetFixtureList(); v; v = v.GetNext()) {
                let shape = v.GetShape()
                if(shape.GetType() == Box2D.ShapeType.e_polygonShape) {
                    let vertices = (shape as Box2D.PolygonShape).m_vertices

                    for (let i = vertices.length - 1; i >= 0; i--) {
                        let vertex = vertices[i]
                        let previousVertex
                        if(i > 0) previousVertex = vertices[i - 1]
                        else previousVertex = vertices[vertices.length - 1]

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
}

export default ServerBulletMine;