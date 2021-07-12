
import EntityModel from './entitymodel';
import GameWorld from 'src/gameworld';

export default class AbstractEntity<WorldClass extends GameWorld = any> {

    protected game: WorldClass

    public getGame(): WorldClass & GameWorld { return this.game }
    public setGame(game: WorldClass & GameWorld) { this.game = game }

    public model: EntityModel = null

    constructor(model: EntityModel) {
        this.model = model
        model.entity = this
    }

    tick(dt: number) {
        this.model.tick(dt)
    }
}