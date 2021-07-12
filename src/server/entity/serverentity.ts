
import AbstractEntity from '../../entity/abstractentity';
import Utils from '../../utils/utils';
import GameMap from '../../utils/map/gamemap';
import * as Box2D from '../../library/box2d';
import EntityModel from "../../entity/entitymodel";
import BlockState from "../../utils/map/blockstate/blockstate";
import Player from "../../utils/player";

class ServerEntity extends AbstractEntity {
	public explodeResistance: any;
	public shooter: Player;
	public types: Map<typeof EntityModel, typeof ServerEntity>;
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

    }

    checkWallHit(x: number, y: number, dx: number, dy: number) {

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