
import EntityModel from '../entitymodel';
import GameWorld from "../../gameworld";

class BulletModel extends EntityModel {

    public affectWalls: any;
    public lifetime: any;
    public type: any;
    public speed: any;
    public shooter: any;

    constructor(game: GameWorld) {
        super(game)
    }
}

export default BulletModel;