import ServerBullet, {ServerBulletConfig} from "../server-bullet";
import BulletModelBomb from "../../../../entity/bullets/models/bomb-bullet-model";

export default class ServerBulletBomb extends ServerBullet {
    static Model = BulletModelBomb

    constructor(options: ServerBulletConfig) {
        super(options);

        this.startVelocity = 50
        this.explodePower = 5
        this.lifeTime = 5
    }
}