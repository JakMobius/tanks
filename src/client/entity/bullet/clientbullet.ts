
import ClientEntity from '../cliententity';
import BulletModel from 'src/entity/bullet/bulletmodel';

class ClientBullet extends ClientEntity {
    static Model: typeof BulletModel = null
}

export default ClientBullet;
