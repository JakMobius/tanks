
import AbstractEntity from '../../entity/abstractentity';
import Utils from '../../utils/utils';
import GameMap from '../../utils/map/gamemap';
import * as Box2D from '../../library/box2d';
import EntityModel from "../../entity/entitymodel";
import BlockState from "../../utils/map/blockstate/blockstate";

interface WallHitPoint {
    point: Box2D.Vec2
    block: Box2D.Vec2
}

class ServerEntity extends AbstractEntity {
	public explodeResistance: any;
	public shooter: any;
	public types: any;
    static types = new Map()
    static globalId = 0

    constructor(model: EntityModel) {
        super(model);

        this.explodeResistance = 0.2

        model.id = ServerEntity.globalId++
    }

    die() {
        this.model.dead = true
    }

    tick(dt: number) {
        this.model.tick(dt)
    }

    checkPlayerHit(x: number, y: number, dx: number, dy: number) {
        if(!this.shooter.tank) return null
        const a = x, b = y;
        const c = x + dx, d = y + dy;

        let distance = null;
        let victim = null;

        for (let player of this.shooter.tank.world.players.values()) {
            if (this.shooter === player) continue

            const tank = player.tank;
            const body = tank.model.body;

            const position = body.GetPosition()
            const playerX = position.x;
            const playerY = position.y;
            const sin = tank.model.matrix.sin;
            const cos = tank.model.matrix.cos;

            for (let v = body.GetFixtureList(); v; v = v.GetNext()) {
                const shape = v.GetShape().GetVertices();

                for (let i = shape.length - 1; i >= 0; i--) {
                    const vertex = shape[i];
                    let previousVertex
                    if (i > 0) previousVertex = shape[i - 1]
                    else previousVertex = shape[shape.length - 1]

                    const x1 = vertex.x * cos - vertex.y * sin + playerX;
                    const y1 = vertex.x * sin + vertex.y * cos + playerY;

                    const x2 = previousVertex.x * cos - previousVertex.y * sin + playerX;
                    const y2 = previousVertex.x * sin + previousVertex.y * cos + playerY;

                    const intersection = Utils.checkLineIntersection(a, b, c, d, x1, y1, x2, y2);

                    if (intersection.onLine1 && intersection.onLine2) {
                        if (!distance || distance > intersection.k) {
                            distance = intersection.k
                            victim = player
                        }
                    }
                }
            }
        }

        if(victim) {
            return {
                distance: distance,
                victim: victim
            }
        }
        return null
    }

    // TODO: переписать на distToSegment

    checkWallHit(x: number, y: number, dx: number, dy: number): WallHitPoint | null {
        const steps = 10

        dx /= steps;
        dy /= steps;

        for (let i = 0; i < steps; i++) {
            x += dx
            y += dy

            const bx = Math.floor(x / GameMap.BLOCK_SIZE)
            const by = Math.floor(y / GameMap.BLOCK_SIZE)

            let block = this.game.map.getBlock(bx, by);

            if(block !== null) {
                if (!(block.constructor as typeof BlockState).isSolid) {
                    continue
                }
            }

            return {
                point: new Box2D.Vec2(x - dx, y - dy),
                block: new Box2D.Vec2(bx, by)
            }
        }

        return null
    }

    static fromModel(model: EntityModel) {
        let type = this.types.get(model.constructor)

        if(type) {
            return new type(model)
        }
        return null
    }

    static associate(modelClass: typeof EntityModel, serverClass: typeof ServerEntity): void {
        this.types.set(modelClass, serverClass)
    }
}

export default ServerEntity;