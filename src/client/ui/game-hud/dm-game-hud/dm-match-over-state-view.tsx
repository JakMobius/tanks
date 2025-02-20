
import GameStateView from "src/client/ui/game-hud/game-state-view";
import React from "react";
import { DMGameStateMatchOver } from "src/entity/types/controller-dm/dm-game-state";
import WorldStatisticsComponent from "src/entity/components/network/world-statistics/world-statistics-component";
import Entity from "src/utils/ecs/entity";

interface DMMatchOverStateViewProps {
    state: DMGameStateMatchOver
    world: Entity
}

const DMMatchOverStateView: React.FC<DMMatchOverStateViewProps> = (props) => {
    const worldStatistics = props.world.getComponent(WorldStatisticsComponent).playerStatistics
    const singleWinner = worldStatistics.reduce((prev, current) => prev.score > current.score ? prev : current)
    const winnerScore = singleWinner.score

    const winners = worldStatistics.filter(team => team.score == winnerScore)

    const getWinners = () => {
        if (winnerScore == 0) {
            return "Никто не заработал очков. Великолепная игра."
        } else if(winners.length == 1) {
            return "Победил игрок " + singleWinner.name + "!"
        } else if(winners.length < 4 && winners.length < worldStatistics.length) {
            return "Победу разделили игроки " + winners.slice(0, -1).join(", ") + " и " + winners[winners.length - 1]
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

export default DMMatchOverStateView