import * as tankStats from "./tank-stats.json"

export type TankStat = {
    speed: number
    damage: number
    health: number
}
export type TankStatJSON = {
    stats: {
        [key: string]: TankStat
    },
    median: TankStat
};
export const TankStats: TankStatJSON = tankStats