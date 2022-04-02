import {Component} from "../utils/ecs/component";
import * as Box2D from "../library/box2d";
import Entity from "../utils/ecs/entity";

export default class PhysicalComponent extends Component {
    body?: Box2D.Body

    constructor(body: Box2D.Body) {
        super()
        this.body = body
    }

    onDetach() {
        super.onDetach()
        this.body.GetWorld().DestroyBody(this.body)
        this.body = null
    }

    onAttach(entity: Entity) {
        super.onAttach(entity);
        this.body.SetUserData(entity)
    }

    getBody() {
        return this.body
    }
}