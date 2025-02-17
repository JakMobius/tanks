import {TDMGameStateMatchOver} from "src/entity/types/controller-tdm/tdm-game-state";
import GameStateView from "src/client/ui/overlay/game-overlay/game-state-view";
import TeamColor from "src/utils/team-color";
import React from "react";

interface TDMMatchOverStateViewProps {
    state: TDMGameStateMatchOver
}

const TDMMatchOverStateView: React.FC<TDMMatchOverStateViewProps> = (props) => {
    const teamStatistics = props.state.teamStatistics
    const singleWinner = teamStatistics.reduce((prev, current) => prev.score > current.score ? prev : current)
    const winnerScore = singleWinner.score

    const winners = teamStatistics.filter(team => team.score == winnerScore)

    const getWinners = () => {
        if (winnerScore == 0) {
            return "Никто не заработал очков. Великолепная игра."
        } else if(winners.length == 1) {
            return (
                <span color={TeamColor.getColor(singleWinner.team).code()}>
                    Победила команда {TeamColor.teamNames[singleWinner.team]}!
                </span>
            )
        } else if(winners.length < teamStatistics.length) {
            const winnerSpans = winners.map((team, index) => (<>
                {index > 0 && <>, </>}
                <span color={TeamColor.getColor(singleWinner.team).code()}>
                    {TeamColor.teamNames[team.team]}
                </span>
            </>))
            return (<>
                Победу разделили команды 
                {winnerSpans.slice(0, -1)} и {winnerSpans[winnerSpans.length - 1]}
            </>)
        } else {
            return "Ничья!"
        }
    }

    return (
        <GameStateView visibility="show" header="Матч окончен">
            {getWinners()}
        </GameStateView>
    )
}

export default TDMMatchOverStateView