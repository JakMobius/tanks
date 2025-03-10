import Entity from "src/utils/ecs/entity";

export interface CTFTeamStatistics {
    team: number
    score: number
}

export enum CTFGameStateType {
    waitingForPlayers,
    playing,
    matchOver
}

export enum CTFFlagEventType {
    flagCapture,
    flagDrop,
    flagDeliver,
    flagReturn
}

export const localizedCTFFlagEventTypes = [
    "захватил", "потерял", "доставил", "вернул"
]

export type CTFGameMatchOverState = {
    state: CTFGameStateType.matchOver
    teamStatistics: CTFTeamStatistics[]
}

export type CTFGamePlayingState = {
    state: CTFGameStateType.playing
    quickMatchEnd: boolean
}

export type CTFGameStateWaitingForPlayers = {
    state: CTFGameStateType.waitingForPlayers
    minPlayers: number
    currentPlayers: number
    timer: Entity
}

export type CTFGameState = CTFGameMatchOverState | CTFGamePlayingState | CTFGameStateWaitingForPlayers

export type CTFEventData = {
    event: CTFFlagEventType
    flagTeam: number
    playerTeam: number
    player: string
}