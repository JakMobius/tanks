
import ServerBullet, {ServerBulletConfig} from '../server-bullet';
import BulletModelMine from '../../../../entity/bullets/models/mine-bullet-model';

export default class ServerBulletMine extends ServerBullet<BulletModelMine> {

    static Model = BulletModelMine
    private explodeDistance: number;
    private squareExplodeDistance: number;

    constructor(options: ServerBulletConfig<BulletModelMine>) {
        super(options);

        this.startVelocity = 0
        this.explodePower = 15
        this.explodeDistance = 5
        this.squareExplodeDistance = this.explodeDistance * this.explodeDistance
    }

    tick(dt: number) {

    }
}