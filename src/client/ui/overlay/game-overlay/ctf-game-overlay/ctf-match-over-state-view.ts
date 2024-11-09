import {CTFGameMatchOverState} from "src/entity/types/controller-ctf/ctf-game-data";
import GameStateView from "src/client/ui/overlay/game-overlay/game-state-view";
import TeamColor from "src/utils/team-color";

export default class CTFMatchOverStateView extends GameStateView {
    state: CTFGameMatchOverState

    setData(state: CTFGameMatchOverState) {
        this.state = state
        this.update()
    }

    update() {
        this.header.text("Матч окончен")
        const teamStatistics = this.state.teamStatistics
        const singleWinner = teamStatistics.reduce((prev, current) => prev.score > current.score ? prev : current)
        const winnerScore = singleWinner.score

        const winners = teamStatistics.filter(team => team.score == winnerScore)

        this.text.empty()

        if (winnerScore == 0) {
            this.text.append("Никто не заработал очков. Великолепная игра.")
        } else if(winners.length == 1) {
            let winnerSpan = $("<span>")
                .css("color", TeamColor.getColor(singleWinner.team).code())
                .text("Победила команда " + TeamColor.teamNames[singleWinner.team] + "!")

            this.text.append(winnerSpan)
        } else if(winners.length < teamStatistics.length) {
            let winnerSpans = winners.map(team => $("<span>")
                .css("color", TeamColor.getColor(singleWinner.team).code())
                .text(TeamColor.teamNames[team.team]))

            this.text.append("Победу разделили команды ")
            this.text.append(winnerSpans.slice(0, -1).join(", "), " и ", winnerSpans[winnerSpans.length - 1])
        } else {
            this.text.append("Ничья!")
        }

        this.show()
    }
}