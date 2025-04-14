import Entity from "src/utils/ecs/entity";
import { EntityType } from "src/entity/entity-prefabs";
import TinyPrefab from "src/entity/types/tank-tiny/server-prefab";

import Silverstone from "src/server/maps/silverstone.json"
import { MapFile, readEntityFile } from "src/map/map-serialization";
import ServerDatabase from "src/server/db/server-database";
import GearboxUnit, { GearboxUnitConfig } from "src/entity/components/transmission/units/gearbox-unit";
import FreeroamController from "src/entity/types/controller-freeroam/server-side/freeroam-controller";
import PlayerTankComponent from "src/entity/types/player/server-side/player-tank-component";
import TransmissionComponent from "src/entity/components/transmission/transmission-component";
import TankEngineUnit, { EngineConfig } from "src/entity/components/transmission/units/tank-engine-unit";

export default class PreviewWorldController {

    game: Entity;
    controller: Entity;

    constructor(serverGame: Entity) {
        this.game = serverGame

        this.createMap()
    }

    private createMap() {
        let map = readEntityFile(Silverstone as MapFile)
        let controller: Entity = null

        let entity = map.createEntity({
            leaf(prefab) {
                if(prefab.metadata.type === EntityType.gameController) {
                    if(prefab.id !== "FREEROAM_CONTROLLER")
                        return null
                }
                let entity = new Entity()
                controller = entity
                return entity
            },
            root(prefab) {
                if(prefab.metadata.type === EntityType.gameController) {
                    if(prefab.id !== "FREEROAM_CONTROLLER")
                        return null
                }
                let entity = new Entity()
                controller = entity
                return entity
            },
        })

        this.game.appendChild(entity)

        controller?.emit("set-world", this.game);
        controller?.emit("set-db", {
            async getUserInfo(login) {
                return {
                    authenticated: true,
                    username: "Player",
                    preferredTank: TinyPrefab.id
                }
            },
        } as ServerDatabase);

        this.controller = controller
    }
}