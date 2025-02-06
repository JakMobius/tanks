import ClientEntityPrefabs from "src/client/entity/client-entity-prefabs";
import EntityPrefabs from "src/entity/entity-prefabs";
import {EntityType} from "src/entity/entity-type";
import ClientBulletBehaviourComponent from "src/client/entity/components/client-bullet-behaviour-component";
import MortarBallHeightComponent from "src/entity/components/network/mortar-ball-height/mortar-ball-height-component";
import MortarBallHeightReceiver from "src/entity/components/network/mortar-ball-height/mortar-ball-height-receiver";
import * as Box2D from "@box2d/core";
import {Drawer} from "src/entity/types/bullet-mortar-ball/client-side/drawer";

ClientEntityPrefabs.associate(EntityType.BULLET_MORTAR_BALL, (entity) => {
    EntityPrefabs.Types.get(EntityType.BULLET_MORTAR_BALL)(entity)
    ClientEntityPrefabs.configureGameWorldEntity(entity)

    //
    entity.on("should-collide", (body: Box2D.b2Body) => false)

    entity.addComponent(new MortarBallHeightComponent())
    entity.addComponent(new MortarBallHeightReceiver())
    entity.addComponent(new ClientBulletBehaviourComponent())
    entity.addComponent(new Drawer())
})