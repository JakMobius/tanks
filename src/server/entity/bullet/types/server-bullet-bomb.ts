import ServerBullet, {ServerBulletConfig} from "../server-bullet";
import BulletModelBomb from "../../../../entity/bullets/models/bomb-bullet-model";

export default class ServerBulletBomb extends ServerBullet<BulletModelBomb> {
    static Model = BulletModelBomb

    constructor(options: ServerBulletConfig<BulletModelBomb>) {
        super(options);

        this.startVelocity = 200
        this.explodePower = 5
        this.lifeTime = 5
    }
}