import Entity from "src/utils/ecs/entity";

export interface TDMTeamStatistics {
    team: number
    score: number
}

export enum TDMGameStateType {
    waitingForPlayers,
    playing,
    matchOver
}

export type TDMGameStateMatchOver = {
    state: TDMGameStateType.matchOver
    teamStatistics: TDMTeamStatistics[]
}

export type TDMGameStatePlaying = {
    state: TDMGameStateType.playing
    quickMatchEnd: boolean
}

export type TDMGameStateWaitingForPlayers = {
    state: TDMGameStateType.waitingForPlayers
    minPlayers: number
    currentPlayers: number
    timer: Entity
}

export type TDMGameState = TDMGameStateMatchOver | TDMGameStatePlaying | TDMGameStateWaitingForPlayers