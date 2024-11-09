import {EntityType} from "src/entity/entity-type";
import Entity from "src/utils/ecs/entity";

export interface TankDescription {
    type: number,
    name: string,
    description: string
}

export function getTankDescription(type: number) {
    return tankDescriptions.find((desc) => desc.type === type)
}

export const tankDescriptions: TankDescription[] = [
    {
        type: EntityType.TANK_SNIPER,
        name: "Снайпер",
        description: "Классический танк. Довольно быстрый и маневренный. " +
            "Взрыв от его снаряда может наносить урон по нескольким соперникам " +
            "одновременно, а длинное дуло обеспечивает высокую точность стрельбы."
    }, {
        type: EntityType.TANK_NASTY,
        name: "Мерзила",
        description: "Любите запах напалма по утрам? Тогда эта машина - " +
            "идеальный выбор для вас! Сложный в управлении, но чудовищно " +
            "разрушительный танк с огнемётом на воздушной подушке."
    }, {
        type: EntityType.TANK_MONSTER,
        name: "Монстр",
        description: "Рассекайте шоссе 66 на монстре! Скоростной пулемёт " +
            "поможет сбить прицел соперника, а мощный двигатель и " +
            "хорошая маневренность позволят оторваться почти от " +
            "любых видов военной техники."
    }, {
        type: EntityType.TANK_BOMBER,
        name: "Бомбер",
        description: "Идеальная машина для партизанской войны! Стены и углы" +
            " - ваши лучшие друзья. Снаряды отскакивают от стен и взрываются" +
            " при столкновении с танком."
    }, {
        type: EntityType.TANK_BIGBOI,
        name: "Big Boi",
        description: "Это невероятное чудо техники создано, чтобы " +
            "уничтожать всё на своём пути. Снаряд этого танка, " +
            "имея огромную массу, способен резко изменить " +
            "траекторию движения соперника или вовсе закрутить и обездвижить его."
    }, {
        type: EntityType.TANK_MORTAR,
        name: "Мортира",
        description: "Подкрадитесь к противнику за стеной и устройте ему незабываемый " +
            "град! Мортира позволит вам использовать стены против противника. Отлично " +
            "подходит для бомбежки строений."
    }, {
        type: EntityType.TANK_TINY,
        name: "Малыш",
        description: "Просто малыш."
    }, {
        type: EntityType.TANK_TESLA,
        name: "Тесла",
        description: "По-настоящему экологичный танк! Высоковольтные разряды способны " +
            "пробивать атмосферу на расстоянии десятков метров и за считанные секунды выводить " +
            "из строя электрику соперника."
    }, {
        type: EntityType.TANK_SHOTGUN,
        name: "Шотган",
        description: "Быстрый и маневренный танк с пушкой-дробовиком. Отлично подходит для " +
            "резких нападений на вражескую базу."
    }
]