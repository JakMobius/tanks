import {CTFGameMatchOverState} from "src/entity/types/controller-ctf/ctf-game-state";
import GameStateView from "src/client/ui/game-hud/game-state-view";
import TeamColor from "src/utils/team-color";
import React from "react";

interface CTFMatchOverStateViewProps {
    state: CTFGameMatchOverState
}

const CTFMatchOverStateView: React.FC<CTFMatchOverStateViewProps> = (props) => {
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

export default CTFMatchOverStateView