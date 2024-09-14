import GameStateView from "src/client/ui/overlay/game-overlay/game-state-view";
import {DMGameStateMatchOver} from "src/entity/types/controller-dm/dm-game-state";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";

export default class DMMatchOverStateView extends GameStateView {
    state: DMGameStateMatchOver

    setState(state: DMGameStateMatchOver) {
        this.state = state
        this.update()
    }

    update() {
        this.header.text("Матч окончен")
        const worldStatistics = this.overlay.world.getComponent(WorldStatisticsComponent).playerStatistics
        const singleWinner = worldStatistics.reduce((prev, current) => prev.score > current.score ? prev : current)
        const winnerScore = singleWinner.score

        const winners = worldStatistics.filter(team => team.score == winnerScore)

        this.text.empty()

        if (winnerScore == 0) {
            this.text.append("Никто не заработал очков. Великолепная игра.")
        } else if(winners.length == 1) {
            let winnerSpan = $("<span>")
                .text("Победил игрок " + singleWinner.name + "!")

            this.text.append(winnerSpan)
        } else if(winners.length < 4 && winners.length < worldStatistics.length) {
            let winnerSpans = winners.map(player => $("<span>").text(player.name))

            this.text.append("Победу разделили игроки ")
            this.text.append(winnerSpans.slice(0, -1).join(", "), " и ", winnerSpans[winnerSpans.length - 1])
        } else {
            this.text.append("Ничья!")
        }

        this.show()
    }
}