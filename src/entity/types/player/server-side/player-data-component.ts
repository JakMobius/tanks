import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import ServerDatabase from "src/server/db/server-database";
import {UserDataRaw} from "src/client/utils/user-data-raw";
import PlayerNickComponent from "src/entity/types/player/server-side/player-nick-component";

export default class PlayerDataComponent implements Component {
    entity: Entity | null = null
    db: ServerDatabase

    constructor(db: ServerDatabase) {
        this.db = db
    }

    async getUserInfo() {
        return this.db.getUserInfo(this.entity.getComponent(PlayerNickComponent).nick)
    }

    onAttach(entity: Entity): void {
        this.entity = entity
    }

    onDetach(): void {
        this.entity = null
    }

    async modifyUserInfo(userInfo: UserDataRaw) {
        return this.db.modifyUserInfo(this.entity.getComponent(PlayerNickComponent).nick, userInfo)
    }
}