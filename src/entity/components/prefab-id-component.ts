import {Component} from "src/utils/ecs/component";
import Entity from "src/utils/ecs/entity";
import {EntityType} from "src/entity/entity-type";
import ServerWorldPlayerManagerComponent from "src/server/entity/components/server-world-player-manager-component";

export default class PrefabIdComponent implements Component {
    entity: Entity | null = null
    prefabId: number

    constructor(id: number) {
        this.prefabId = id
    }

    onAttach(entity: Entity) {
        this.entity = entity
    }

    onDetach() {
        this.entity = null
    }
}

const prefabNames = new Map<number, string>([
    [EntityType.WORLD,                           "Мир"],

    // Bullets:
    [EntityType.BULLET_16MM,                     "Снаряд 16мм"],
    [EntityType.BULLET_42MM,                     "Снаряд 42мм"],
    [EntityType.BULLET_BOMB,                     "Бомба"],
    [EntityType.BULLET_CANNONBALL,               "Пушечное ядро"],
    [EntityType.BULLET_MINE,                     "Мина"],
    [EntityType.BULLET_MORTAR_BALL,              "Снаряд мортиры"],

    // Tanks:
    [EntityType.TANK_BIGBOI,                     "Танк 'Бигбой'"],
    [EntityType.TANK_BOMBER,                     "Танк 'Бомбер'"],
    [EntityType.TANK_MONSTER,                    "Танк 'Монстр'"],
    [EntityType.TANK_NASTY,                      "Танк 'Мерзила'"],
    [EntityType.TANK_SNIPER,                     "Танк 'Снайпер'"],
    [EntityType.TANK_SHOTGUN,                    "Танк 'Шотган'"],
    [EntityType.TANK_MORTAR,                     "Танк 'Мортира'"],
    [EntityType.TANK_TESLA,                      "Танк 'Тесла'"],
    [EntityType.TANK_TINY,                       "Танк 'Малыш'"],

    // Weapons:
    [EntityType.WEAPON_SINGLE_BARRELLED,         "Одноствольная пушка"],
    [EntityType.WEAPON_DOUBLE_BARELLED,          "Двухствольная пушка"],
    [EntityType.WEAPON_STUNGUN,                  "Электрошокер"],
    [EntityType.WEAPON_SHOTGUN,                  "Дробовик"],
    [EntityType.WEAPON_FLAMETHROWER,             "Огнемет"],

    // Effects:
    [EntityType.EFFECT_FLAME,                    "Эффект 'пламя'"],
    [EntityType.EFFECT_SHOTGUN_PELLETS,          "Эффект 'дробь'"],
    [EntityType.EFFECT_WORLD_EXPLOSION,          "Эффект 'взрыв'"],
    [EntityType.EFFECT_SOUND_EFFECT,             "Эффект 'звук'"],

    // Other:
    [EntityType.TILEMAP,                         "Карта"],
    [EntityType.FLAG,                            "Флаг"],
    [EntityType.SPAWNZONE,                       "Зона спавна"],

    // Game mode controllers:
    [EntityType.TDM_GAME_MODE_CONTROLLER_ENTITY, "Контроллер режима TDM"],
    [EntityType.CTF_GAME_MODE_CONTROLLER_ENTITY, "Контроллер режима CTF"],
    [EntityType.DM_GAME_MODE_CONTROLLER_ENTITY,  "Контроллер режима DM"],
    [EntityType.FREEROAM_CONTROLLER_ENTITY,      "Контроллер режима FR"],

    // Utilities:
    [EntityType.TIMER_ENTITY,                    "Таймер"],
    [EntityType.CHAT_ENTITY,                     "Чат"],
    [EntityType.GROUP,                           "Группа"],
])

export function getPrefabNameForId(id: number) {
    if(prefabNames.has(id)) {
        return prefabNames.get(id)
    }
    
    for (let key in EntityType) {
        if (id === (EntityType as { [key: string]: number })[key]) return key
    }
    return null
}

export function getPrefabNameForEntity(entity: Entity) {
    if (!entity) {
        return "NULL"
    }
    if (entity.getComponent(ServerWorldPlayerManagerComponent)) {
        return "WORLD"
    }
    let index = entity.getComponent(PrefabIdComponent)?.prefabId
    return getPrefabNameForId(index)
}

export function getPrefabNamesForParents(entity: Entity): string {
    if (!entity) {
        return "NULL"
    }
    let name = this.getPrefabNameForEntity(entity)
    if (entity.parent) {
        return this.getPrefabNamesForParents(entity.parent) + " - " + name
    }
    return name
}