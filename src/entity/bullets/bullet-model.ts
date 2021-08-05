
import EntityModel from '../entity-model';
import * as Box2D from '../../library/box2d'
import AbstractEntity from "../abstract-entity";

export default class BulletModel extends EntityModel {
    public diesAfterWallHit: boolean = true

}