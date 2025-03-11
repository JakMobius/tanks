import { PropertyInspector, VectorProperty } from "src/entity/components/inspector/property-inspector"
import EventHandlerComponent from "src/utils/ecs/event-handler-component"

export class GameTimeComponent extends EventHandlerComponent {
    minPlayers = 2
    matchTime = 305
    matchStartDelay = 10
    matchEndDelay = 10

    constructor() {
        super()

        this.eventHandler.on("inspector-added", (inspector: PropertyInspector) => {
            inspector.addProperty(new VectorProperty("matchTime", 1)
                .withName("Продолжительность матча")
                .withGetter(() => [this.matchTime])
                .withSetter((time) => this.matchTime = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addProperty(new VectorProperty("matchStartDelay", 1)
                .withName("Задержка до начала матча")
                .withGetter(() => [this.matchStartDelay])
                .withSetter((time) => this.matchStartDelay = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addProperty(new VectorProperty("matchEndDelay", 1)
                .withName("Задержка до перезапуска матча")
                .withGetter(() => [this.matchEndDelay])
                .withSetter((time) => this.matchEndDelay = time[0])
                .replaceNaN()
                .requirePositive()
            )

            inspector.addProperty(new VectorProperty("minPlayers", 1)
                .withName("Минимальное количество игроков")
                .withGetter(() => [this.minPlayers])
                .withSetter((count) => this.minPlayers = count[0])
                .replaceNaN()
                .requirePositive()
            )
        })
    }
}