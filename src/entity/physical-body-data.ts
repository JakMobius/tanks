
import * as Box2D from '@box2d/core'
import PhysicsChunk from 'src/physics/physics-chunk'
import Entity from 'src/utils/ecs/entity'

interface Box2DUserData {
    entity?: WeakRef<Entity>,
    physicsChunk?: WeakRef<PhysicsChunk>
}

export function getObjectFromBody(body: Box2D.b2Body) {
    return body.GetUserData() as Box2DUserData
}