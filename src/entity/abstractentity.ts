
import EntityModel from './entitymodel';
import GameWorld from 'src/gameworld';

class AbstractEntity {
    public model: EntityModel = null
    public game: GameWorld

    constructor(model: EntityModel) {
        this.model = model
        model.entity = this
    }

    tick(dt: number) {
        this.model.tick(dt)
    }
}

export default AbstractEntity;